"""Chat endpoint handling wizard submissions, free-text chat, and SSE streaming."""
from __future__ import annotations

import uuid

from fastapi import APIRouter, Request
from fastapi.responses import StreamingResponse
from langchain_core.messages import HumanMessage
from sqlalchemy import select

from app.api.schemas import ChatRequest
from app.db.database import get_session
from app.db.models import Thread
from app.services import profile as profile_svc
from app.streaming import stream_agent_execution

router = APIRouter(prefix="/api", tags=["chat"])


def _format_wizard_prompt(p: dict) -> str:
    parts = ["Here are my shopping preferences from the boutique style wizard:"]
    if p.get("gender"):
        parts.append(f"- Looking for: {p['gender']}")
    if p.get("categories"):
        parts.append(f"- Categories: {', '.join(p['categories'])}")
    if p.get("sizes"):
        parts.append(f"- Sizes: {', '.join(p['sizes'])}")
    if p.get("colors"):
        parts.append(f"- Preferred colors: {', '.join(p['colors'])}")
    if p.get("styles"):
        parts.append(f"- Styles: {', '.join(p['styles'])}")
    if p.get("fits"):
        parts.append(f"- Fits: {', '.join(p['fits'])}")
    if p.get("materials"):
        parts.append(f"- Preferred materials: {', '.join(p['materials'])}")
    if p.get("brands"):
        parts.append(f"- Favorite brands: {', '.join(p['brands'])}")
    if p.get("price_min") is not None or p.get("price_max") is not None:
        p_min = p.get("price_min", 0)
        p_max = p.get("price_max", "any")
        parts.append(f"- Budget range: ${p_min} to ${p_max}")
    if p.get("min_rating"):
        parts.append(f"- Minimum rating: {p['min_rating']} stars")
    if p.get("in_stock_only"):
        parts.append("- In-stock only: Yes")

    parts.append(
        "\nPlease search our catalog, recommend the best matching items with a 1-sentence "
        "styling reason for each, and guide me on how to style them."
    )
    return "\n".join(parts)


@router.post("/chat")
async def chat_endpoint(payload: ChatRequest, request: Request):
    """Start or continue a chat session with the AI Stylist via Server-Sent Events."""
    agent = request.app.state.agent
    store = getattr(request.app.state, "store", None)

    user_id = payload.user_id or "guest"
    thread_id = payload.thread_id or str(uuid.uuid4())
    user_text = payload.message or ""

    # If preferences came from the wizard, format as structured prompt and save to long-term memory
    if payload.preferences:
        user_text = _format_wizard_prompt(payload.preferences)
        if store:
            await profile_svc.update_profile(
                store,
                user_id,
                {
                    "gender": payload.preferences.get("gender"),
                    "clothing_size": (payload.preferences.get("sizes") or [None])[0],
                    "favorite_colors": payload.preferences.get("colors"),
                    "styles": payload.preferences.get("styles"),
                    "fits": payload.preferences.get("fits"),
                    "materials": payload.preferences.get("materials"),
                    "brands": payload.preferences.get("brands"),
                    "budget_max": payload.preferences.get("price_max"),
                },
            )

    if not user_text:
        user_text = "Hello! Please introduce yourself and suggest some popular pieces from the store."

    # Record or touch thread in DB
    with get_session() as s:
        th = s.scalar(select(Thread).where(Thread.thread_id == thread_id))
        if not th:
            title = "Personal Styling"
            if payload.preferences and payload.preferences.get("categories"):
                cats = ", ".join(payload.preferences["categories"][:2])
                title = f"Styling: {cats.title()}"
            elif payload.message:
                title = payload.message[:35].strip() + ("..." if len(payload.message) > 35 else "")
            th = Thread(thread_id=thread_id, user_id=user_id, title=title)
            s.add(th)

    input_messages = [HumanMessage(content=user_text)]

    return StreamingResponse(
        stream_agent_execution(
            agent=agent,
            input_messages=input_messages,
            user_id=user_id,
            thread_id=thread_id,
        ),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        },
    )
