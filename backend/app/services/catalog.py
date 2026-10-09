"""Catalog queries: structured search, details, comparison, outfits, options."""
from __future__ import annotations

from dataclasses import dataclass, field, replace

from sqlalchemy import and_, exists, func, select
from sqlalchemy.orm import Session

from app.db import catalog_data as cd
from app.db.models import Product, ProductVariant

MAX_LIMIT = 8


@dataclass
class SearchFilters:
    gender: str | None = None
    categories: list[str] | None = None
    sizes: list[str] | None = None
    colors: list[str] | None = None
    styles: list[str] | None = None
    fits: list[str] | None = None
    materials: list[str] | None = None
    brands: list[str] | None = None
    min_price: float | None = None
    max_price: float | None = None
    min_rating: float | None = None
    in_stock_only: bool = True
    exclude_ids: list[str] = field(default_factory=list)

    def active(self) -> dict:
        """Filters that are actually set (used for relaxation hints)."""
        names = ["gender", "categories", "sizes", "colors", "styles", "fits", "materials",
                 "brands", "min_price", "max_price", "min_rating"]
        return {n: getattr(self, n) for n in names if getattr(self, n) not in (None, [], "")}


def _gender_clause(gender: str):
    if gender in ("men", "women"):
        return Product.gender.in_([gender, "unisex"])
    return Product.gender == gender


def _build_query(f: SearchFilters):
    q = select(Product)
    conds = []
    if f.gender:
        conds.append(_gender_clause(f.gender))
    if f.categories:
        conds.append(Product.category.in_(f.categories))
    if f.colors:
        conds.append(Product.color.in_(f.colors))
    if f.styles:
        conds.append(Product.style.in_(f.styles))
    if f.fits:
        conds.append(Product.fit.in_(f.fits))
    if f.materials:
        conds.append(Product.material.in_(f.materials))
    if f.brands:
        conds.append(Product.brand.in_(f.brands))
    if f.min_price is not None:
        conds.append(Product.price >= f.min_price)
    if f.max_price is not None:
        conds.append(Product.price <= f.max_price)
    if f.min_rating is not None:
        conds.append(Product.rating >= f.min_rating)
    if f.exclude_ids:
        conds.append(Product.id.not_in(f.exclude_ids))

    variant_conds = [ProductVariant.product_id == Product.id]
    if f.in_stock_only:
        variant_conds.append(ProductVariant.stock > 0)
    if f.sizes:
        # "One Size" items always qualify when the user filters by size.
        variant_conds.append(ProductVariant.size.in_([*f.sizes, "One Size"]))
    if f.in_stock_only or f.sizes:
        conds.append(exists().where(and_(*variant_conds)))

    return q.where(*conds) if conds else q


SORTS = {
    "relevance": (Product.rating.desc(), Product.review_count.desc()),
    "rating": (Product.rating.desc(), Product.review_count.desc()),
    "price_asc": (Product.price.asc(),),
    "price_desc": (Product.price.desc(),),
}


def search(session: Session, f: SearchFilters, sort_by: str = "relevance", limit: int = MAX_LIMIT):
    limit = max(1, min(int(limit or MAX_LIMIT), MAX_LIMIT))
    base = _build_query(f)
    total = session.scalar(select(func.count()).select_from(base.subquery())) or 0
    rows = session.scalars(base.order_by(*SORTS.get(sort_by, SORTS["relevance"])).limit(limit)).all()
    return total, list(rows)


def relaxation_hints(session: Session, f: SearchFilters) -> list[str]:
    """When nothing matches, report how many items each single relaxed filter would return."""
    hints = []
    for name in f.active():
        relaxed = replace(f, **{name: None})
        total = session.scalar(select(func.count()).select_from(_build_query(relaxed).subquery())) or 0
        if total:
            hints.append(f"without the {name} filter: {total} matches")
    return hints


def get_products(session: Session, ids: list[str]) -> list[Product]:
    if not ids:
        return []
    found = {p.id: p for p in session.scalars(select(Product).where(Product.id.in_(ids))).all()}
    return [found[i] for i in ids if i in found]


def get_product(session: Session, product_id: str) -> Product | None:
    return session.get(Product, product_id.strip().upper())


def compare(products: list[Product]) -> dict:
    attrs = ["brand", "price", "rating", "review_count", "color", "style", "fit", "material"]
    table = {a: {p.id: getattr(p, a) for p in products} for a in attrs}
    table["sizes_in_stock"] = {p.id: p.sizes_in_stock for p in products}
    cheapest = min(products, key=lambda p: p.price)
    top_rated = max(products, key=lambda p: (p.rating, p.review_count))
    best_value = max(products, key=lambda p: p.rating / max(p.price, 1))
    return {
        "products": [{"id": p.id, "name": p.name} for p in products],
        "table": table,
        "highlights": {"cheapest": cheapest.id, "top_rated": top_rated.id, "best_value": best_value.id},
    }


def _outfit_gender_ok(anchor_gender: str, candidate_gender: str) -> bool:
    if anchor_gender == "kids":
        return candidate_gender == "kids"
    if anchor_gender == "unisex":
        return candidate_gender != "kids"
    return candidate_gender in (anchor_gender, "unisex")


def complete_outfit(session: Session, anchor: Product, max_total_budget: float | None = None) -> dict:
    slots = cd.COMPLEMENTS.get(anchor.category, [])
    remaining = None if max_total_budget is None else max_total_budget - anchor.price
    compatible_styles = cd.STYLE_COMPAT.get(anchor.style, {anchor.style})
    items: list[Product] = []
    skipped: list[str] = []

    for i, slot in enumerate(slots):
        cands = session.scalars(
            select(Product).where(
                Product.category == slot,
                Product.style.in_(compatible_styles),
                Product.id != anchor.id,
                exists().where(and_(ProductVariant.product_id == Product.id, ProductVariant.stock > 0)),
            )
        ).all()
        cands = [c for c in cands if _outfit_gender_ok(anchor.gender, c.gender)
                 and cd.colors_match(anchor.color, c.color)
                 and all(cd.colors_match(it.color, c.color) for it in items)]
        if remaining is not None:
            slots_left = len(slots) - i
            cap = remaining / max(slots_left, 1) * 1.5
            cands = [c for c in cands if c.price <= min(cap, remaining)]
        if not cands:
            skipped.append(slot)
            continue
        best = max(cands, key=lambda c: (c.style == anchor.style, c.rating, c.review_count))
        items.append(best)
        if remaining is not None:
            remaining -= best.price

    total = round(anchor.price + sum(i.price for i in items), 2)
    return {"anchor": anchor, "items": items, "total": total, "skipped_slots": skipped}


def store_options(session: Session) -> dict:
    """Everything the preference wizard needs, derived from the live catalog."""
    rows = session.execute(select(Product.gender, Product.category).distinct()).all()
    cats_by_gender: dict[str, set[str]] = {g: set() for g in cd.GENDERS}
    for g, c in rows:
        cats_by_gender[g].add(c)
    for g in ("men", "women"):
        cats_by_gender[g] |= cats_by_gender["unisex"]
    price_min, price_max = session.execute(select(func.min(Product.price), func.max(Product.price))).one()
    return {
        "genders": cd.GENDERS,
        "categories_by_gender": {g: [c for c in cd.CATEGORIES if c in cs] for g, cs in cats_by_gender.items()},
        "styles": cd.STYLES,
        "fits": cd.FITS,
        "materials": cd.MATERIALS,
        "colors": [{"name": n, "hex": h} for n, h in cd.COLORS.items()],
        "brands": list(cd.BRANDS),
        "sizes": {
            "clothing": cd.ADULT_CLOTHING_SIZES,
            "kids_clothing": cd.KIDS_CLOTHING_SIZES,
            "shoes": cd.SHOE_SIZES,
        },
        "shoe_categories": sorted(cd.SHOE_CATEGORIES),
        "price_range": {"min": float(price_min or 0), "max": float(price_max or 0)},
    }
