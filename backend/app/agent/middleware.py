"""Custom middleware for personalization and prompt-injection protection."""
from __future__ import annotations

import re
from typing import Any

from langchain.agents.middleware import (
    AgentMiddleware,
    AgentState,
    ModelRequest,
    Runtime,
    dynamic_prompt,
    hook_config,
)
from langchain_core.messages import AIMessage, HumanMessage

from app.agent.context import UserContext
from app.agent.prompts import BASE_SYSTEM_PROMPT
from app.config import get_settings
from app.services import profile as profile_svc

INJECTION_PATTERNS = [
    r"ignore\s+(all\s+)?(previous|prior)\s+instructions",
    r"disregard\s+(all\s+)?(previous|prior)\s+instructions",
    r"reveal\s+(the\s+)?(system\s+prompt|developer\s+instructions)",
    r"what\s+are\s+your\s+(internal\s+)?instructions",
    r"you\s+are\s+now\s+in\s+developer\s+mode",
    r"dan\s+mode",
]


@dynamic_prompt
async def inject_user_memory(request: ModelRequest[UserContext]) -> str:
    """Add the current customer's saved preferences to the system prompt."""
    runtime = request.runtime
    store = getattr(runtime, "store", None)
    context = getattr(runtime, "context", None)
    user_id = getattr(context, "user_id", None) if context else None
    profile_text = ""

    if store and user_id:
        try:
            profile = await profile_svc.get_profile(store, user_id)
            profile_text = profile_svc.profile_to_prompt(profile)
        except Exception:
            profile_text = ""

    if profile_text:
        return f"{BASE_SYSTEM_PROMPT}\n\nCUSTOMER PROFILE & PREVIOUSLY SAVED PREFERENCES:\n{profile_text}"
    return BASE_SYSTEM_PROMPT


class PromptGuardMiddleware(AgentMiddleware[AgentState, UserContext]):
    """Guards against adversarial injection and keeps the agent on topic."""

    @hook_config(can_jump_to=["end"])
    async def abefore_model(
        self,
        state: AgentState,
        runtime: Runtime[UserContext],
    ) -> dict[str, Any] | None:
        settings = get_settings()
        if not settings.prompt_guard_enabled:
            return None

        messages = state.get("messages", [])
        if not messages:
            return None

        last_human = next(
            (message for message in reversed(messages) if isinstance(message, HumanMessage)),
            None,
        )
        if not last_human:
            return None

        text = str(last_human.content).strip().lower()

        if any(re.search(pattern, text, re.IGNORECASE) for pattern in INJECTION_PATTERNS):
            refusal = (
                "I am Threadly, your personal fashion stylist! I'm here exclusively to help "
                "you discover clothes, style outfits, and find your perfect fit. How can I "
                "assist your wardrobe today?"
            )
            return {"messages": [AIMessage(content=refusal)], "jump_to": "end"}

        return None
