"""Long-term user profile stored in the LangGraph store.

Namespace: ("users", <user_id>)   Key: "profile"
"""
from __future__ import annotations

from datetime import datetime, timezone
from typing import Any

from langgraph.store.base import BaseStore

LIST_FIELDS = ["favorite_colors", "styles", "fits", "materials", "brands", "categories", "dislikes", "notes"]
SCALAR_FIELDS = ["gender", "clothing_size", "shoe_size", "budget_max", "height_cm", "weight_kg"]
MAX_LIST_LEN = 12


def _ns(user_id: str) -> tuple[str, str]:
    return ("users", user_id)


async def get_profile(store: BaseStore, user_id: str) -> dict:
    item = await store.aget(_ns(user_id), "profile")
    return dict(item.value) if item else {}


def merge(profile: dict, updates: dict[str, Any]) -> dict:
    merged = dict(profile)
    for k in LIST_FIELDS:
        new = updates.get(k)
        if not new:
            continue
        if isinstance(new, str):
            new = [new]
        existing = [x for x in merged.get(k, []) if x not in new]
        merged[k] = (list(new) + existing)[:MAX_LIST_LEN]  # newest first
    for k in SCALAR_FIELDS:
        if updates.get(k) not in (None, "", []):
            merged[k] = updates[k]
    # A newly liked color should no longer be in dislikes, and vice versa.
    if updates.get("favorite_colors") and merged.get("dislikes"):
        merged["dislikes"] = [d for d in merged["dislikes"] if d not in updates["favorite_colors"]]
    merged["updated_at"] = datetime.now(timezone.utc).isoformat()
    return merged


async def update_profile(store: BaseStore, user_id: str, updates: dict[str, Any]) -> dict:
    profile = merge(await get_profile(store, user_id), updates)
    await store.aput(_ns(user_id), "profile", profile)
    return profile


async def delete_profile(store: BaseStore, user_id: str) -> None:
    await store.adelete(_ns(user_id), "profile")


def profile_to_prompt(profile: dict) -> str:
    if not profile:
        return ""
    labels = {
        "gender": "Shops for", "clothing_size": "Clothing size", "shoe_size": "Shoe size (EU)",
        "height_cm": "Height (cm)", "weight_kg": "Weight (kg)", "budget_max": "Usual max budget (USD)",
        "favorite_colors": "Favorite colors", "styles": "Preferred styles", "fits": "Preferred fits",
        "materials": "Preferred materials", "brands": "Favorite brands", "categories": "Interested in",
        "dislikes": "Dislikes / avoid", "notes": "Notes",
    }
    lines = []
    for k, label in labels.items():
        v = profile.get(k)
        if v in (None, "", []):
            continue
        lines.append(f"- {label}: {', '.join(map(str, v)) if isinstance(v, list) else v}")
    return "\n".join(lines)
