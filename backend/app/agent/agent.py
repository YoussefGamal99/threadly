"""Threadly AI Stylist Agent factory with LangChain v1 create_agent and middleware."""
from __future__ import annotations

from langchain.agents import create_agent
from langchain.agents.middleware import (
    ModelCallLimitMiddleware,
    ModelFallbackMiddleware,
    ModelRetryMiddleware,
    SummarizationMiddleware,
    ToolCallLimitMiddleware,
    ToolRetryMiddleware,
)
from langchain_groq import ChatGroq
from langgraph.checkpoint.base import BaseCheckpointSaver
from langgraph.store.base import BaseStore
from pydantic import SecretStr

from app.agent.context import UserContext
from app.agent.middleware import PromptGuardMiddleware, inject_user_memory
from app.agent.prompts import BASE_SYSTEM_PROMPT
from app.agent.tools import ALL_TOOLS
from app.config import get_settings


def create_stylist_agent(
    checkpointer: BaseCheckpointSaver | None = None,
    store: BaseStore | None = None,
):
    """Instantiate the Threadly stylist agent graph."""
    settings = get_settings()

    api_key = SecretStr(settings.groq_api_key or "gsk_placeholder_for_graph_compilation")

    primary_model = ChatGroq(
        model=settings.primary_model,
        api_key=api_key,
        temperature=0.3,
        max_retries=0,
    )

    fallback_models = [
        ChatGroq(
            model=m,
            api_key=api_key,
            temperature=0.3,
            max_retries=0,
        )
        for m in settings.fallback_model_list
    ]

    summary_model = ChatGroq(
        model=settings.summary_model,
        api_key=api_key,
        temperature=0.0,
    )

    middleware_chain = [
        PromptGuardMiddleware(),
        inject_user_memory,
        SummarizationMiddleware(
            model=summary_model,
            trigger=("tokens", settings.summary_trigger_tokens),
            keep=("messages", settings.summary_keep_messages),
        ),
        ModelFallbackMiddleware(*fallback_models),
        ModelRetryMiddleware(
            max_retries=2,
            backoff_factor=2.0,
            initial_delay=1.0,
            on_failure="error",
        ),
        ToolRetryMiddleware(max_retries=1),
        ToolCallLimitMiddleware(run_limit=8),
        ModelCallLimitMiddleware(run_limit=10),
    ]

    return create_agent(
        model=primary_model,
        tools=ALL_TOOLS,
        system_prompt=BASE_SYSTEM_PROMPT,
        context_schema=UserContext,
        checkpointer=checkpointer,
        store=store,
        middleware=middleware_chain,
    )
