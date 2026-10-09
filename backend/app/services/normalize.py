"""Input normalization + validation shared by tools and the REST API.

LLMs often send near-miss values ("gray", "tshirt", "Shoes", a single string
instead of a list). We normalize them, and reject truly invalid values with
a helpful message listing valid options so the model can self-correct.
"""
from __future__ import annotations

from app.db import catalog_data as cd

SYNONYMS: dict[str, dict[str, str]] = {
    "gender": {"man": "men", "male": "men", "mens": "men", "woman": "women", "female": "women",
               "womens": "women", "ladies": "women", "kid": "kids", "children": "kids", "child": "kids",
               "boys": "kids", "girls": "kids", "boy": "kids", "girl": "kids", "any": "unisex"},
    "category": {"tshirt": "t-shirts", "tshirts": "t-shirts", "t-shirt": "t-shirts", "tee": "t-shirts",
                 "tees": "t-shirts", "shirt": "shirts", "blouse": "shirts", "blouses": "shirts",
                 "jean": "jeans", "denim": "jeans", "pants": "trousers", "trouser": "trousers",
                 "chinos": "trousers", "joggers": "trousers", "dress": "dresses", "skirt": "skirts",
                 "jacket": "jackets", "coat": "jackets", "coats": "jackets", "blazer": "jackets",
                 "hoodie": "hoodies", "sweatshirt": "hoodies", "sneaker": "sneakers", "trainers": "sneakers",
                 "running shoes": "sneakers", "formal shoes": "formal-shoes", "formal_shoes": "formal-shoes",
                 "heels": "formal-shoes", "boots": "formal-shoes", "loafers": "formal-shoes",
                 "accessory": "accessories", "bag": "accessories", "bags": "accessories",
                 "cap": "accessories", "hat": "accessories", "belt": "accessories", "scarf": "accessories"},
    "color": {"gray": "grey", "lightblue": "light-blue", "light blue": "light-blue", "sky blue": "light-blue",
              "cream": "beige", "tan": "beige", "khaki": "beige", "maroon": "burgundy", "wine": "burgundy",
              "dark blue": "navy", "denim": "indigo", "dark denim": "indigo", "charcoal": "grey"},
    "style": {"sport": "sporty", "athletic": "sporty", "street": "streetwear", "urban": "streetwear",
              "business": "formal", "elegant": "formal", "smart": "formal", "timeless": "classic",
              "everyday": "casual"},
    "fit": {"loose": "oversized", "relaxed": "oversized", "baggy": "oversized", "skinny": "slim",
            "tight": "slim", "fitted": "slim", "normal": "regular", "standard": "regular"},
    "material": {"silk": "polyester", "synthetic": "polyester", "nylon": "polyester", "jean": "denim",
                 "merino": "wool", "cashmere": "wool"},
}

VOCAB: dict[str, list[str]] = {
    "gender": cd.GENDERS,
    "category": cd.CATEGORIES,
    "color": list(cd.COLORS),
    "style": cd.STYLES,
    "fit": cd.FITS,
    "material": cd.MATERIALS,
}


def _canon(kind: str, value: str) -> str:
    v = value.strip().lower().replace("_", "-") if kind != "category" else value.strip().lower()
    v = SYNONYMS.get(kind, {}).get(v, v)
    v = SYNONYMS.get(kind, {}).get(v.replace("-", " "), v)
    if v not in VOCAB[kind]:
        raise ValueError(f"Invalid {kind} '{value}'. Valid options: {', '.join(VOCAB[kind])}.")
    return v


def norm_one(kind: str, value: str | None) -> str | None:
    if value is None or (isinstance(value, str) and not value.strip()):
        return None
    return _canon(kind, value)


def as_list(value) -> list[str] | None:
    if value is None:
        return None
    if isinstance(value, str):
        value = [v for v in value.replace(";", ",").split(",")]
    out = [str(v).strip() for v in value if v is not None and str(v).strip()]
    return out or None


def norm_list(kind: str, values) -> list[str] | None:
    values = as_list(values)
    if not values:
        return None
    return sorted({_canon(kind, v) for v in values})


def norm_brands(values) -> list[str] | None:
    values = as_list(values)
    if not values:
        return None
    lookup = {b.lower(): b for b in cd.BRANDS}
    out = []
    for v in values:
        b = lookup.get(v.lower())
        if not b:
            raise ValueError(f"Unknown brand '{v}'. Valid brands: {', '.join(cd.BRANDS)}.")
        out.append(b)
    return sorted(set(out))


def norm_sizes(values) -> list[str] | None:
    values = as_list(values)
    if not values:
        return None
    lookup = {s.lower(): s for s in cd.ALL_SIZES}
    lookup.update({"one size": "One Size", "onesize": "One Size", "2xl": "XXL", "xxs": "XS"})
    out = []
    for v in values:
        key = v.lower().replace("eu", "").strip()
        if key.endswith("y") is False and key.isdigit() and int(key) in (4, 6, 8, 10, 12, 14) and int(key) < 28:
            key = f"{key}y"
        s = lookup.get(key)
        if not s:
            raise ValueError(f"Invalid size '{v}'. Clothing: XS-XXL, kids: 4Y-14Y, shoes: EU 28-46, or 'One Size'.")
        out.append(s)
    return sorted(set(out))
