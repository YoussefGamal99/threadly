"""Streaming engine converting LangGraph graph stream to SSE events."""
from __future__ import annotations

import json
import re
from typing import Any, AsyncGenerator

from langchain_core.messages import AIMessageChunk, ToolMessage
from sqlalchemy import select

from app.db.database import get_session
from app.db.models import Product

PRODUCT_REF_REGEX = re.compile(r"\[\[(P\d{4})\]\]")

TOOL_FRIENDLY_NAMES = {
    "search_products": "Searching product catalog...",
    "semantic_search": "Exploring style vibes & matching items...",
    "get_product_details": "Checking fabric details & sizing...",
    "compare_products": "Comparing items side-by-side...",
    "complete_the_outfit": "Styling complementary pieces...",
    "size_advisor": "Calculating fit & size recommendation...",
    "add_to_cart": "Adding item to your shopping bag...",
    "view_cart": "Viewing current shopping bag...",
    "remove_from_cart": "Removing item from shopping bag...",
    "save_user_preferences": "Remembering your style preferences...",
}


def sse_pack(event: str, data: Any) -> str:
    """Format SSE payload."""
    payload = json.dumps(data, ensure_ascii=False) if not isinstance(data, str) else data
    return f"event: {event}\ndata: {payload}\n\n"


async def stream_agent_execution(
    agent,
    input_messages: list,
    user_id: str,
    thread_id: str,
) -> AsyncGenerator[str, None]:
    """Execute the agent graph asynchronously and stream rich typed SSE events."""
    from app.agent.context import UserContext

    config = {"configurable": {"thread_id": thread_id}}
    context = UserContext(user_id=user_id)

    full_response_text = ""
    seen_product_ids: set[str] = set()

    try:
        async for chunk_type, chunk in agent.astream(
            {"messages": input_messages},
            config=config,
            context=context,
            stream_mode=["messages", "custom", "updates"],
        ):
            if chunk_type == "messages":
                msg_chunk, _metadata = chunk
                if isinstance(msg_chunk, AIMessageChunk):
                    if msg_chunk.tool_call_chunks:
                        for tc in msg_chunk.tool_call_chunks:
                            name = tc.get("name")
                            if name:
                                label = TOOL_FRIENDLY_NAMES.get(name, f"Running {name}...")
                                yield sse_pack(
                                    "status",
                                    {"tool": name, "label": label, "status": "running"},
                                )

                    if msg_chunk.content:
                        text = str(msg_chunk.content)
                        full_response_text += text
                        yield sse_pack("token", {"delta": text})

            elif chunk_type == "custom":
                evt_type = chunk.get("type", "custom")
                if evt_type == "summary":
                    yield sse_pack("status", {"tool": chunk.get("tool"), "label": chunk.get("text"), "status": "done"})
                elif evt_type in ("comparison", "outfit", "size_advice", "cart", "memory"):
                    yield sse_pack(evt_type, chunk)

            elif chunk_type == "updates":
                for node_name, update in chunk.items():
                    if node_name == "tools":
                        msgs = update.get("messages", [])
                        for m in msgs:
                            if isinstance(m, ToolMessage):
                                yield sse_pack(
                                    "status",
                                    {
                                        "tool": m.name or "tool",
                                        "label": f"Completed {m.name or 'tool'}",
                                        "status": "done",
                                    },
                                )

        # Extract product references cited by the agent
        refs = PRODUCT_REF_REGEX.findall(full_response_text)
        new_ids = [pid for pid in refs if pid not in seen_product_ids]
        if new_ids:
            seen_product_ids.update(new_ids)
            with get_session() as s:
                products = s.scalars(select(Product).where(Product.id.in_(new_ids))).all()
                card_lookup = {p.id: p.to_card() for p in products}
                cards = [card_lookup[pid] for pid in new_ids if pid in card_lookup]
                if cards:
                    yield sse_pack("products", {"products": cards})

        yield sse_pack("done", {"thread_id": thread_id})

    except Exception as e:
        error_msg = str(e)
        if "rate_limit" in error_msg.lower() or "429" in error_msg:
            yield sse_pack(
                "notice",
                {"message": "High traffic on free tier, switching model / retrying..."},
            )
        yield sse_pack("error", {"message": error_msg})
        yield sse_pack("done", {"thread_id": thread_id})
