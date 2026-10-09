"""Shared helpers for agent tools."""
from __future__ import annotations

import json
from typing import Any

from langchain.tools import ToolRuntime


def dump(obj: Any) -> str:
    """Compact JSON to keep tool results token-efficient."""
    return json.dumps(obj, separators=(",", ":"), ensure_ascii=False, default=str)


def emit(runtime: ToolRuntime | None, event: dict) -> None:
    """Send a custom UI event through LangGraph's `custom` stream mode (no-op if unavailable)."""
    writer = getattr(runtime, "stream_writer", None) if runtime is not None else None
    if writer is None:
        return
    try:
        writer(event)
    except Exception:  # never let UI plumbing break a tool
        pass


def error(msg: str) -> str:
    return dump({"error": msg})


def user_id_of(runtime: ToolRuntime | None) -> str:
    if runtime is None:
        return "guest"
    ctx = runtime.context
    uid = getattr(ctx, "user_id", None) if ctx is not None else None
    if not uid:
        return "guest"
    return uid
