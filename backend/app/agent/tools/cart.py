"""Cart tools — the agent can manage the cart that the UI displays."""
from __future__ import annotations

from typing import Annotated

from langchain.tools import ToolRuntime, tool
from pydantic import Field

from app.agent.tools.common import dump, emit, error, user_id_of
from app.db.database import get_session
from app.services import cart as cart_svc


def _summarize(cart: dict) -> dict:
    return {"count": cart["count"], "total": cart["total"],
            "items": [{"product_id": i["product_id"], "name": i["name"], "size": i["size"], "qty": i["qty"]}
                      for i in cart["items"]]}


@tool
def add_to_cart(
    product_id: Annotated[str, Field(description="Product id like P0123")],
    size: Annotated[str, Field(description="Exact size, e.g. M, 42, 8Y, One Size")],
    qty: int = 1,
    runtime: ToolRuntime = None,  # type: ignore[assignment]
) -> str:
    """Add a product in a specific size to the user's cart. Only call when the user asks to add/buy."""
    try:
        with get_session() as s:
            cart = cart_svc.add_item(s, user_id_of(runtime), product_id, size, qty)
    except (cart_svc.CartError, ValueError) as e:
        return error(str(e))
    emit(runtime, {"type": "cart", "cart": cart, "action": "added", "product_id": product_id.upper()})
    return dump({"ok": True, "cart": _summarize(cart)})


@tool
def view_cart(runtime: ToolRuntime = None) -> str:  # type: ignore[assignment]
    """Show the items currently in the user's cart and the total."""
    with get_session() as s:
        cart = cart_svc.cart_payload(s, user_id_of(runtime))
    return dump(_summarize(cart))


@tool
def remove_from_cart(
    product_id: Annotated[str, Field(description="Product id like P0123")],
    size: Annotated[str | None, Field(description="Optional; omit to remove all sizes")] = None,
    runtime: ToolRuntime = None,  # type: ignore[assignment]
) -> str:
    """Remove a product (optionally a specific size) from the user's cart."""
    try:
        with get_session() as s:
            cart = cart_svc.remove_item(s, user_id_of(runtime), product_id, size)
    except (cart_svc.CartError, ValueError) as e:
        return error(str(e))
    emit(runtime, {"type": "cart", "cart": cart, "action": "removed", "product_id": product_id.upper()})
    return dump({"ok": True, "cart": _summarize(cart)})
