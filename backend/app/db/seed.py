"""Generate a deterministic synthetic clothes catalog and build the vector index.

Usage:
    uv run python -m app.db.seed           # seed only if empty
    uv run python -m app.db.seed --reset   # wipe and regenerate
"""
from __future__ import annotations

import argparse
import random

from sqlalchemy import func, select

from app.db import catalog_data as cd
from app.db.database import engine, get_session, init_db
from app.db.models import Base, Product, ProductVariant

SEED = 42

OPENERS = ["A versatile", "A standout", "A modern", "An elevated", "A must-have", "A refined", "A comfortable"]
KIDS_LINES = ["Tough enough for the playground and easy to wash.", "Made for active kids who never sit still."]


def _pick_brand(rng: random.Random, gender: str, category: str, style: str) -> str:
    candidates = [
        b for b, info in cd.BRANDS.items()
        if category in info["categories"] and style in info["styles"]
        and (gender != "kids" or b in cd.KIDS_BRANDS)
        and (gender == "kids" or b != "Kinder Bloom")
    ]
    if not candidates:
        candidates = [b for b, info in cd.BRANDS.items() if category in info["categories"]]
    return rng.choice(candidates)


def _pick_color(rng: random.Random, allowed: list[str] | None, style: str) -> str:
    if allowed:
        return rng.choice(allowed)
    palette = list(cd.COLORS)
    palette.remove("indigo")
    # Neutrals are more common in real stores; formal pieces skew darker.
    weights = []
    for c in palette:
        w = 3 if c in cd.NEUTRALS else 1
        if style == "formal" and c in {"yellow", "pink", "red", "light-blue"}:
            w = 0.3
        weights.append(w)
    return rng.choices(palette, weights=weights, k=1)[0]


def _nouns(gender: str, category: str, style: str, subtype: str | None) -> list[str]:
    if category == "accessories":
        return cd.ACCESSORY_NOUNS[subtype or "bag"]
    if category == "formal-shoes" and gender == "women":
        return cd.WOMEN_FORMAL_SHOE_NOUNS[style]
    if category == "shirts" and gender == "women":
        return cd.WOMEN_SHIRT_NOUNS[style]
    return cd.NOUNS[category][style]


def _price(rng: random.Random, band: tuple[int, int], gender: str, material: str, brand: str) -> float:
    base = rng.uniform(*band)
    if gender == "kids":
        base *= 0.6
    if material == "leather":
        base *= 1.3
    elif material == "wool":
        base *= 1.15
    if brand in {"Atelier Nine", "Maison Lune"}:
        base *= 1.2
    return round(base) - 0.01  # psychological pricing, e.g. 49.99


def generate_products(rng: random.Random) -> list[Product]:
    products: list[Product] = []
    seen_names: set[str] = set()
    pid = 1

    for (gender, category), count in cd.TARGET_COUNTS.items():
        rules = cd.CATEGORY_RULES[category]
        made = 0
        attempts = 0
        while made < count and attempts < count * 20:
            attempts += 1
            subtype = None
            styles, materials, band, allowed_colors = rules["styles"], rules["materials"], rules["price"], rules.get("colors")
            if category == "accessories":
                subtype = rng.choice(list(cd.ACCESSORY_TYPES))
                at = cd.ACCESSORY_TYPES[subtype]
                styles, materials, band = at["styles"], at["materials"], at["price"]
                allowed_colors = at.get("colors")

            style = rng.choice(styles)
            if gender == "kids" and style == "formal":
                continue
            material = rng.choice(materials)
            fit = rng.choice(rules["fits"])
            color = _pick_color(rng, allowed_colors, style)
            brand = _pick_brand(rng, gender, category, style)
            noun = rng.choice(_nouns(gender, category, style, subtype))

            fit_word = {"slim": "Slim", "oversized": "Oversized"}.get(fit, "")
            color_word = color.replace("-", " ").title()
            material_word = material.title() if material not in noun.lower() else ""
            parts = [brand, fit_word if category not in cd.SHOE_CATEGORIES | {"accessories"} else "",
                     color_word, material_word, noun]
            name = " ".join(p for p in parts if p)
            if gender == "kids":
                name = f"{name} (Kids)"
            if name in seen_names:
                continue
            seen_names.add(name)

            desc_lines = [
                f"{rng.choice(OPENERS)} {noun.lower()} in {color.replace('-', ' ')} {material}.",
                rng.choice(cd.STYLE_LINES[style]),
                cd.MATERIAL_LINES[material],
            ]
            if category not in cd.SHOE_CATEGORIES | {"accessories"}:
                desc_lines.append(cd.FIT_LINES[fit])
            if gender == "kids":
                desc_lines.append(rng.choice(KIDS_LINES))

            product = Product(
                id=f"P{pid:04d}",
                name=name,
                brand=brand,
                gender=gender,
                category=category,
                subtype=subtype,
                style=style,
                fit=fit,
                material=material,
                color=color,
                color_hex=cd.COLORS[color],
                price=_price(rng, band, gender, material, brand),
                rating=round(rng.triangular(3.2, 5.0, 4.4), 1),
                review_count=rng.randint(3, 900),
                description=" ".join(desc_lines),
                image=cd.image_url(cd.image_key(gender, category, subtype)),
            )
            sold_out = rng.random() < 0.08  # some products entirely out of stock
            for size in cd.sizes_for(gender, category):
                stock = 0 if sold_out or rng.random() < 0.15 else rng.randint(1, 25)
                product.variants.append(ProductVariant(size=size, stock=stock))
            products.append(product)
            pid += 1
            made += 1
    return products


def seed(reset: bool = False) -> None:
    if reset:
        Base.metadata.drop_all(engine)
    init_db()

    with get_session() as s:
        existing = s.scalar(select(func.count()).select_from(Product))
    if existing and not reset:
        print(f"Catalog already has {existing} products. Use --reset to regenerate.")
        return

    rng = random.Random(SEED)
    products = generate_products(rng)
    with get_session() as s:
        s.add_all(products)
    print(f"Inserted {len(products)} products with "
          f"{sum(len(p.variants) for p in products)} size variants.")

    from app.vectorstore import rebuild_index  # heavy import: only when needed

    with get_session() as s:
        all_products = s.scalars(select(Product)).all()
        n = rebuild_index(all_products)
    print(f"Indexed {n} products in the vector store.")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Seed the Threadly catalog")
    parser.add_argument("--reset", action="store_true", help="drop and regenerate all data")
    seed(parser.parse_args().reset)
