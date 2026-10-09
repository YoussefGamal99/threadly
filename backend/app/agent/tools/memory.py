"""Long-term memory tool."""
from __future__ import annotations

from typing import Annotated

from langchain.tools import ToolRuntime, tool
from pydantic import Field

from app.agent.tools.common import dump, emit, error, user_id_of
from app.services import normalize as n
from app.services import profile as profile_svc

StrList = str | list[str] | None


@tool
async def save_user_preferences(
    gender: Annotated[str | None, Field(description="men | women | unisex | kids")] = None,
    clothing_size: str | None = None,
    shoe_size: Annotated[str | None, Field(description="EU size")] = None,
    height_cm: float | None = None,
    weight_kg: float | None = None,
    budget_max: Annotated[float | None, Field(description="Usual max price per item (USD)")] = None,
    favorite_colors: StrList = None,
    styles: StrList = None,
    fits: StrList = None,
    materials: StrList = None,
    brands: StrList = None,
    dislikes: Annotated[StrList, Field(description="Things to avoid, e.g. 'yellow', 'skinny jeans'")] = None,
    notes: Annotated[StrList, Field(description="Other lasting facts, e.g. 'vegan - no leather'")] = None,
    runtime: ToolRuntime = None,  # type: ignore[assignment]
) -> str:
    """Remember LASTING customer preferences across conversations (sizes, favorite colors/styles,
    budget, dislikes). Call when the user states a stable preference, not for one-off requests."""
    if runtime is None or runtime.store is None:
        return error("Memory store unavailable.")
    try:
        updates = {
            "gender": n.norm_one("gender", gender),
            "clothing_size": clothing_size.upper() if clothing_size else None,
            "shoe_size": shoe_size,
            "height_cm": height_cm,
            "weight_kg": weight_kg,
            "budget_max": budget_max,
            "favorite_colors": n.norm_list("color", favorite_colors),
            "styles": n.norm_list("style", styles),
            "fits": n.norm_list("fit", fits),
            "materials": n.norm_list("material", materials),
            "brands": n.norm_brands(brands),
            "dislikes": n.as_list(dislikes),
            "notes": n.as_list(notes),
        }
    except ValueError as e:
        return error(str(e))
    updates = {k: v for k, v in updates.items() if v not in (None, [], "")}
    if not updates:
        return error("Nothing to save.")
    profile = await profile_svc.update_profile(runtime.store, user_id_of(runtime), updates)
    emit(runtime, {"type": "memory", "saved": list(updates), "profile": profile})
    return dump({"ok": True, "saved": list(updates)})
