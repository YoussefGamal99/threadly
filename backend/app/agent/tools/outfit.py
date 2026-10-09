"""Outfit-building tool."""
from __future__ import annotations

from typing import Annotated

from langchain.tools import ToolRuntime, tool
from pydantic import Field

from app.agent.tools.common import dump, emit, error
from app.db.database import get_session
from app.services import catalog as svc


@tool
def complete_the_outfit(
    product_id: Annotated[str, Field(description="Anchor product id the outfit is built around")],
    max_total_budget: Annotated[float | None, Field(description="Optional budget for the WHOLE outfit incl. anchor (USD)")] = None,
    runtime: ToolRuntime = None,  # type: ignore[assignment]
) -> str:
    """Suggest matching items (style- and color-coordinated, in stock, same gender) that complete
    an outfit around a product, e.g. jeans -> t-shirt + jacket + sneakers."""
    with get_session() as s:
        anchor = svc.get_product(s, product_id)
        if not anchor:
            return error(f"Product {product_id} not found.")
        if max_total_budget is not None and max_total_budget <= anchor.price:
            return error(f"Budget {max_total_budget} is not above the anchor price {anchor.price}.")
        res = svc.complete_outfit(s, anchor, max_total_budget)
        payload = {
            "anchor": anchor.to_compact(),
            "items": [{**p.to_compact(), "category": p.category} for p in res["items"]],
            "total_price": res["total"],
            "could_not_fill": res["skipped_slots"],
        }
        emit(runtime, {"type": "outfit", "anchor": anchor.to_card(),
                       "items": [p.to_card() for p in res["items"]], "total": res["total"]})
    return dump(payload)
