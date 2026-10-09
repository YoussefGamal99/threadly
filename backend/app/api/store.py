"""REST endpoints for store options, catalog items, cart, profile, and history."""
from __future__ import annotations

from fastapi import APIRouter, HTTPException, Query, Request
from sqlalchemy import desc, select

from app.api.schemas import CartItemRequest, CartQuantityRequest, CompareRequest, ProfileRequest
from app.db.database import get_session
from app.db.models import Thread
from app.services import cart as cart_svc
from app.services import catalog as catalog_svc
from app.services import profile as profile_svc

router = APIRouter(prefix="/api", tags=["store"])


@router.get("/options")
def get_wizard_options():
    """Retrieve catalog options for the interactive preference wizard."""
    with get_session() as s:
        return catalog_svc.store_options(s)


@router.get("/products/{product_id}")
def get_product(product_id: str):
    """Retrieve full product card with real-time stock."""
    with get_session() as s:
        product = catalog_svc.get_product(s, product_id)
        if not product:
            raise HTTPException(status_code=404, detail="Product not found")
        return product.to_card()


@router.post("/compare")
def compare_products_endpoint(payload: CompareRequest):
    """Compare 2-4 products side-by-side."""
    with get_session() as s:
        products = catalog_svc.get_products(s, payload.product_ids)
        if len(products) < 2:
            raise HTTPException(status_code=400, detail="At least 2 valid products required")
        return catalog_svc.compare(products)


@router.get("/cart")
def get_cart(user_id: str = Query(default="guest")):
    """Get the current shopping bag for a user."""
    with get_session() as s:
        return cart_svc.cart_payload(s, user_id)


@router.post("/cart")
def add_to_cart(item: CartItemRequest):
    """Add a product variant to the cart."""
    with get_session() as s:
        try:
            return cart_svc.add_item(s, item.user_id, item.product_id, item.size, item.qty)
        except (cart_svc.CartError, ValueError) as e:
            raise HTTPException(status_code=400, detail=str(e))


@router.put("/cart")
def update_cart_qty(item: CartQuantityRequest):
    """Update item quantity in cart."""
    with get_session() as s:
        try:
            return cart_svc.set_qty(s, item.user_id, item.product_id, item.size, item.qty)
        except (cart_svc.CartError, ValueError) as e:
            raise HTTPException(status_code=400, detail=str(e))


@router.delete("/cart/{product_id}")
def remove_from_cart(product_id: str, user_id: str = Query(default="guest"), size: str | None = None):
    """Remove item from cart."""
    with get_session() as s:
        try:
            return cart_svc.remove_item(s, user_id, product_id, size)
        except (cart_svc.CartError, ValueError) as e:
            raise HTTPException(status_code=400, detail=str(e))


@router.delete("/cart")
def clear_cart(user_id: str = Query(default="guest")):
    """Clear all items in cart."""
    with get_session() as s:
        return cart_svc.clear(s, user_id)


@router.get("/profile/{user_id}")
async def get_user_profile(user_id: str, request: Request):
    """Retrieve remembered long-term preferences."""
    store = getattr(request.app.state, "store", None)
    if not store:
        return {}
    return await profile_svc.get_profile(store, user_id)


@router.put("/profile/{user_id}")
async def update_user_profile(user_id: str, payload: ProfileRequest, request: Request):
    """Save or update remembered preferences."""
    store = getattr(request.app.state, "store", None)
    if not store:
        return {}
    return await profile_svc.update_profile(store, user_id, payload.updates())


@router.delete("/profile/{user_id}")
async def delete_user_profile(user_id: str, request: Request):
    """Erase user profile from long-term memory."""
    store = getattr(request.app.state, "store", None)
    if store:
        await profile_svc.delete_profile(store, user_id)
    return {"ok": True, "message": "Preferences deleted"}


@router.get("/threads/{user_id}")
def list_threads(user_id: str):
    """List recent conversation threads for the sidebar."""
    with get_session() as s:
        threads = s.scalars(
            select(Thread).where(Thread.user_id == user_id).order_by(desc(Thread.updated_at)).limit(20)
        ).all()
        return [
            {
                "thread_id": t.thread_id,
                "title": t.title,
                "updated_at": t.updated_at.isoformat() if t.updated_at else None,
            }
            for t in threads
        ]
