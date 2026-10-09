"""Size advisor tool (deterministic size charts)."""
from __future__ import annotations

from typing import Annotated, Literal

from langchain.tools import ToolRuntime, tool
from pydantic import Field

from app.agent.tools.common import dump, emit, error
from app.db import catalog_data as cd
from app.services import normalize as n

# Upper weight bound (kg) for each adult size
WEIGHT_BOUNDS = {
    "men": [("XS", 58), ("S", 68), ("M", 78), ("L", 90), ("XL", 103), ("XXL", 999)],
    "women": [("XS", 50), ("S", 58), ("M", 67), ("L", 77), ("XL", 88), ("XXL", 999)],
}
TALL = {"men": 188, "women": 178}
SHORT = {"men": 165, "women": 155}
KIDS_HEIGHT = [("4Y", 110), ("6Y", 122), ("8Y", 134), ("10Y", 146), ("12Y", 158), ("14Y", 999)]


def _shift(sizes: list[str], idx: int, delta: int) -> str:
    return sizes[max(0, min(len(sizes) - 1, idx + delta))]


def advise(gender: str, category: str, height_cm: float | None, weight_kg: float | None,
           fit_preference: str | None, foot_length_cm: float | None) -> dict:
    if category == "accessories":
        return {"recommended": "One Size", "alternative": None, "reasoning": "Accessories are one size."}

    if category in cd.SHOE_CATEGORIES:
        if not foot_length_cm:
            return {"need_more_info": "Ask for foot length in cm (heel to longest toe) or their usual EU shoe size."}
        eu = round((foot_length_cm + 1.5) * 1.5)
        valid = [int(s) for s in cd.SHOE_SIZES["unisex" if gender == "unisex" else gender]]
        eu = max(min(valid), min(max(valid), eu))
        alt = eu + 1 if (foot_length_cm + 1.5) * 1.5 - round((foot_length_cm + 1.5) * 1.5) > 0.2 else None
        return {"recommended": str(eu), "alternative": str(alt) if alt and alt in valid else None,
                "reasoning": f"Foot length {foot_length_cm} cm maps to about EU {eu}."}

    if gender == "kids":
        if not height_cm:
            return {"need_more_info": "Ask for the child's height in cm."}
        size = next(s for s, h in KIDS_HEIGHT if height_cm <= h)
        sizes = [s for s, _ in KIDS_HEIGHT]
        alt = _shift(sizes, sizes.index(size), 1) if fit_preference == "oversized" else None
        return {"recommended": size, "alternative": alt,
                "reasoning": f"Height {height_cm} cm fits size {size}."}

    g = "women" if gender == "women" else "men"
    if not weight_kg or not height_cm:
        return {"need_more_info": "Ask for height (cm) and weight (kg)."}
    sizes = [s for s, _ in WEIGHT_BOUNDS[g]]
    idx = next(i for i, (_, w) in enumerate(WEIGHT_BOUNDS[g]) if weight_kg <= w)
    reasons = [f"{weight_kg} kg suggests {sizes[idx]}"]
    if height_cm >= TALL[g]:
        idx = min(idx + 1, len(sizes) - 1)
        reasons.append(f"tall ({height_cm} cm) so one size up for length")
    elif height_cm < SHORT[g]:
        idx = max(idx - 1, 0)
        reasons.append(f"petite ({height_cm} cm) so one size down")
    recommended = sizes[idx]
    alternative = None
    if fit_preference == "oversized":
        alternative = _shift(sizes, idx, 1)
        reasons.append(f"for an oversized look you could go {alternative}")
    elif fit_preference == "slim":
        alternative = _shift(sizes, idx, -1) if idx > 0 else None
        if alternative:
            reasons.append(f"for a snug slim fit consider {alternative}")
    return {"recommended": recommended, "alternative": alternative, "reasoning": "; ".join(reasons) + "."}


@tool
def size_advisor(
    gender: Annotated[str, Field(description="men | women | unisex | kids")],
    category: Annotated[str, Field(description="Product category, e.g. jeans, sneakers")],
    height_cm: float | None = None,
    weight_kg: float | None = None,
    fit_preference: Literal["slim", "regular", "oversized"] | None = None,
    foot_length_cm: Annotated[float | None, Field(description="For shoes")] = None,
    runtime: ToolRuntime = None,  # type: ignore[assignment]
) -> str:
    """Recommend a size from body measurements. Clothing needs height+weight (kids: height),
    shoes need foot length in cm."""
    try:
        g = n.norm_one("gender", gender) or "unisex"
        c = n.norm_one("category", category)
    except ValueError as e:
        return error(str(e))
    if not c:
        return error("Category is required for size advice.")
    result = advise(g, c, height_cm, weight_kg, fit_preference, foot_length_cm)
    if "recommended" in result:
        emit(runtime, {"type": "size_advice", "category": c, **result})
    return dump(result)
