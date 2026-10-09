"""Catalog tools: structured search, semantic search, details, comparison."""
from __future__ import annotations

from typing import Annotated, Literal

from langchain.tools import ToolRuntime, tool
from pydantic import Field

from app.agent.tools.common import dump, emit, error
from app.db.database import get_session
from app.services import catalog as svc
from app.services import normalize as n
from app.vectorstore import semantic_search_ids

StrList = str | list[str] | None


@tool
def search_products(
    gender: Annotated[str | None, Field(description="men | women | unisex | kids")] = None,
    categories: Annotated[StrList, Field(description="t-shirts, shirts, jeans, trousers, dresses, skirts, jackets, hoodies, sneakers, formal-shoes, accessories")] = None,
    sizes: Annotated[StrList, Field(description="XS-XXL, kids 4Y-14Y, shoes EU 28-46")] = None,
    colors: Annotated[StrList, Field(description="black, white, navy, grey, beige, brown, olive, green, burgundy, red, pink, blue, light-blue, yellow, indigo")] = None,
    styles: Annotated[StrList, Field(description="casual, formal, sporty, streetwear, classic")] = None,
    fits: Annotated[StrList, Field(description="slim, regular, oversized")] = None,
    materials: Annotated[StrList, Field(description="cotton, linen, wool, denim, leather, polyester")] = None,
    brands: Annotated[StrList, Field(description="Brand names")] = None,
    min_price: float | None = None,
    max_price: float | None = None,
    min_rating: Annotated[float | None, Field(description="1-5")] = None,
    in_stock_only: bool = True,
    exclude_ids: Annotated[StrList, Field(description="Product ids to skip (e.g. already shown)")] = None,
    sort_by: Literal["relevance", "price_asc", "price_desc", "rating"] = "relevance",
    limit: Annotated[int, Field(description="max 8")] = 6,
    runtime: ToolRuntime = None,  # type: ignore[assignment]
) -> str:
    """Search the store catalog with structured filters. Use this first for any concrete preference.
    All filters are optional; list filters match ANY of the given values."""
    try:
        f = svc.SearchFilters(
            gender=n.norm_one("gender", gender),
            categories=n.norm_list("category", categories),
            sizes=n.norm_sizes(sizes),
            colors=n.norm_list("color", colors),
            styles=n.norm_list("style", styles),
            fits=n.norm_list("fit", fits),
            materials=n.norm_list("material", materials),
            brands=n.norm_brands(brands),
            min_price=min_price, max_price=max_price, min_rating=min_rating,
            in_stock_only=in_stock_only,
            exclude_ids=[i.upper() for i in (n.as_list(exclude_ids) or [])],
        )
    except ValueError as e:
        return error(str(e))

    with get_session() as s:
        total, rows = svc.search(s, f, sort_by=sort_by, limit=limit)
        result: dict = {"total_matches": total, "showing": len(rows),
                        "products": [p.to_compact() for p in rows]}
        if total == 0:
            result["relax_suggestions"] = svc.relaxation_hints(s, f)
    emit(runtime, {"type": "summary", "tool": "search_products",
                   "text": f"Found {total} match{'es' if total != 1 else ''}"})
    return dump(result)


@tool
def semantic_search(
    query: Annotated[str, Field(description="Natural-language description, e.g. 'cozy outfit for a cold office'")],
    gender: Annotated[str | None, Field(description="men | women | unisex | kids")] = None,
    category: Annotated[str | None, Field(description="Optional single category")] = None,
    max_price: float | None = None,
    limit: Annotated[int, Field(description="max 8")] = 6,
    runtime: ToolRuntime = None,  # type: ignore[assignment]
) -> str:
    """Find products by meaning when the request is vague, descriptive or about an occasion/season/vibe
    (e.g. 'something for a summer beach wedding'). Results are ranked by similarity."""
    try:
        g = n.norm_one("gender", gender)
        c = n.norm_one("category", category)
    except ValueError as e:
        return error(str(e))
    hits = semantic_search_ids(query, gender=g, category=c, max_price=max_price,
                               k=max(1, min(int(limit or 6), svc.MAX_LIMIT)))
    with get_session() as s:
        products = svc.get_products(s, [pid for pid, _ in hits])
        scores = dict(hits)
        items = [{**p.to_compact(), "similarity": scores[p.id]} for p in products]
    emit(runtime, {"type": "summary", "tool": "semantic_search",
                   "text": f"Found {len(items)} similar item{'s' if len(items) != 1 else ''}"})
    return dump({"query": query, "products": items})


@tool
def get_product_details(
    product_id: Annotated[str, Field(description="Product id like P0123")],
    runtime: ToolRuntime = None,  # type: ignore[assignment]
) -> str:
    """Get full details of one product: description, brand, and stock for every size."""
    with get_session() as s:
        p = svc.get_product(s, product_id)
        if not p:
            return error(f"Product {product_id} not found.")
        card = p.to_card()
    card.pop("image", None)
    card.pop("color_hex", None)
    emit(runtime, {"type": "summary", "tool": "get_product_details", "text": f"Loaded {card['name']}"})
    return dump(card)


@tool
def compare_products(
    product_ids: Annotated[list[str], Field(description="2 to 4 product ids")],
    runtime: ToolRuntime = None,  # type: ignore[assignment]
) -> str:
    """Compare 2-4 products side by side (price, rating, material, fit, sizes) and highlight
    the cheapest, top-rated and best-value option."""
    ids = list(dict.fromkeys(i.strip().upper() for i in (n.as_list(product_ids) or [])))
    if not 2 <= len(ids) <= 4:
        return error("Provide between 2 and 4 distinct product ids.")
    with get_session() as s:
        products = svc.get_products(s, ids)
        missing = set(ids) - {p.id for p in products}
        if missing:
            return error(f"Unknown product ids: {', '.join(sorted(missing))}.")
        result = svc.compare(products)
        cards = [p.to_card() for p in products]
    emit(runtime, {"type": "comparison", "products": cards, "highlights": result["highlights"]})
    return dump(result)
