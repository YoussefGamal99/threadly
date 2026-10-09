"""Cart operations (used by agent tools and REST routes)."""
from __future__ import annotations

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.db.models import CartItem, Product, ProductVariant


class CartError(ValueError):
    pass


def cart_payload(session: Session, user_id: str) -> dict:
    items = session.scalars(
        select(CartItem).where(CartItem.user_id == user_id).order_by(CartItem.added_at)
    ).all()
    out = []
    for it in items:
        p = it.product
        out.append({
            "product_id": p.id, "name": p.name, "brand": p.brand, "image": p.image,
            "color": p.color, "color_hex": p.color_hex, "size": it.size, "qty": it.qty,
            "price": p.price, "line_total": round(p.price * it.qty, 2),
        })
    return {
        "items": out,
        "count": sum(i["qty"] for i in out),
        "total": round(sum(i["line_total"] for i in out), 2),
    }


def add_item(session: Session, user_id: str, product_id: str, size: str, qty: int = 1) -> dict:
    product_id = product_id.strip().upper()
    product = session.get(Product, product_id)
    if not product:
        raise CartError(f"Product {product_id} does not exist.")
    if qty < 1 or qty > 10:
        raise CartError("Quantity must be between 1 and 10.")
    sizes = {v.size.lower(): v for v in product.variants}
    variant: ProductVariant | None = sizes.get(size.strip().lower())
    if variant is None:
        raise CartError(f"Size '{size}' is not offered for {product.name}. "
                        f"Available sizes: {', '.join(v.size for v in product.variants)}.")
    item = session.scalar(select(CartItem).where(
        CartItem.user_id == user_id, CartItem.product_id == product_id, CartItem.size == variant.size))
    new_qty = (item.qty if item else 0) + qty
    if variant.stock < new_qty:
        in_stock = product.sizes_in_stock
        raise CartError(f"Only {variant.stock} left in size {variant.size}. "
                        f"Sizes in stock: {', '.join(in_stock) if in_stock else 'none'}.")
    if item:
        item.qty = new_qty
    else:
        session.add(CartItem(user_id=user_id, product_id=product_id, size=variant.size, qty=qty))
    session.flush()
    return cart_payload(session, user_id)


def set_qty(session: Session, user_id: str, product_id: str, size: str, qty: int) -> dict:
    item = session.scalar(select(CartItem).where(
        CartItem.user_id == user_id, CartItem.product_id == product_id.upper(), CartItem.size == size))
    if not item:
        raise CartError("Item is not in the cart.")
    if qty <= 0:
        session.delete(item)
    else:
        variant = next((v for v in item.product.variants if v.size == size), None)
        if variant and variant.stock < qty:
            raise CartError(f"Only {variant.stock} left in size {size}.")
        item.qty = qty
    session.flush()
    return cart_payload(session, user_id)


def remove_item(session: Session, user_id: str, product_id: str, size: str | None = None) -> dict:
    q = select(CartItem).where(CartItem.user_id == user_id, CartItem.product_id == product_id.strip().upper())
    if size:
        q = q.where(CartItem.size == size)
    items = session.scalars(q).all()
    if not items:
        raise CartError(f"{product_id} is not in the cart.")
    for it in items:
        session.delete(it)
    session.flush()
    return cart_payload(session, user_id)


def clear(session: Session, user_id: str) -> dict:
    for it in session.scalars(select(CartItem).where(CartItem.user_id == user_id)).all():
        session.delete(it)
    session.flush()
    return cart_payload(session, user_id)
