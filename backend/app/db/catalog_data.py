"""Static vocabulary for the synthetic clothes-store catalog.

Everything the seed generator, the agent tools (validation) and the
wizard options endpoint need to agree on lives here.
"""
from __future__ import annotations

IMAGE_EXT = "jpg"

GENDERS = ["men", "women", "unisex", "kids"]

CATEGORIES = [
    "t-shirts", "shirts", "jeans", "trousers", "dresses", "skirts",
    "jackets", "hoodies", "sneakers", "formal-shoes", "accessories",
]

STYLES = ["casual", "formal", "sporty", "streetwear", "classic"]
FITS = ["slim", "regular", "oversized"]
MATERIALS = ["cotton", "linen", "wool", "denim", "leather", "polyester"]

COLORS: dict[str, str] = {
    "black": "#1c1c1e",
    "white": "#f4f2ec",
    "navy": "#1f2a44",
    "grey": "#8a8d91",
    "beige": "#d8c8a8",
    "brown": "#6b4a2f",
    "olive": "#6b7044",
    "green": "#2f6b4f",
    "burgundy": "#6d1f2e",
    "red": "#b3262e",
    "pink": "#e8a5b8",
    "blue": "#3a6ea5",
    "light-blue": "#a7c7e7",
    "yellow": "#e8c547",
    "indigo": "#2e3a5c",
}

# Brand -> (tagline, styles it makes, categories it makes)
BRANDS: dict[str, dict] = {
    "Nordvik": {"styles": {"classic", "casual"}, "categories": set(CATEGORIES) - {"dresses", "skirts"}},
    "Atelier Nine": {"styles": {"formal", "classic"}, "categories": {"shirts", "trousers", "jackets", "formal-shoes", "dresses", "skirts", "accessories"}},
    "UrbanThread": {"styles": {"streetwear", "casual"}, "categories": {"t-shirts", "hoodies", "jeans", "jackets", "sneakers", "accessories"}},
    "Pulse Athletics": {"styles": {"sporty"}, "categories": {"t-shirts", "hoodies", "sneakers", "trousers", "accessories", "jackets"}},
    "Maison Lune": {"styles": {"formal", "classic", "casual"}, "categories": {"dresses", "skirts", "shirts", "trousers", "jackets", "formal-shoes", "accessories"}},
    "Indigo Lab": {"styles": {"casual", "streetwear", "classic"}, "categories": {"jeans", "jackets", "skirts", "shirts"}},
    "Terra Loom": {"styles": {"casual", "classic"}, "categories": {"shirts", "t-shirts", "trousers", "dresses", "accessories"}},
    "Stride": {"styles": {"casual", "sporty", "streetwear", "formal", "classic"}, "categories": {"sneakers", "formal-shoes"}},
    "Kinder Bloom": {"styles": {"casual", "sporty", "streetwear"}, "categories": {"t-shirts", "jeans", "hoodies", "sneakers"}},
    "Vellum": {"styles": {"classic", "formal", "casual", "streetwear"}, "categories": {"accessories"}},
}
KIDS_BRANDS = {"Kinder Bloom", "Pulse Athletics", "UrbanThread", "Stride"}

CATEGORY_RULES: dict[str, dict] = {
    "t-shirts": {"styles": ["casual", "sporty", "streetwear"], "materials": ["cotton", "polyester", "linen"],
                 "fits": FITS, "price": (15, 45)},
    "shirts": {"styles": ["formal", "classic", "casual"], "materials": ["cotton", "linen"],
               "fits": ["slim", "regular", "oversized"], "price": (30, 95)},
    "jeans": {"styles": ["casual", "streetwear", "classic"], "materials": ["denim"],
              "fits": FITS, "price": (40, 120),
              "colors": ["indigo", "black", "light-blue", "grey", "white"]},
    "trousers": {"styles": ["formal", "classic", "casual", "sporty"], "materials": ["cotton", "wool", "linen", "polyester"],
                 "fits": ["slim", "regular", "oversized"], "price": (35, 110)},
    "dresses": {"styles": ["formal", "casual", "classic"], "materials": ["cotton", "linen", "polyester"],
                "fits": ["slim", "regular"], "price": (45, 180)},
    "skirts": {"styles": ["casual", "classic", "formal"], "materials": ["cotton", "denim", "wool", "polyester"],
               "fits": ["slim", "regular"], "price": (30, 90)},
    "jackets": {"styles": ["casual", "classic", "streetwear", "formal", "sporty"], "materials": ["denim", "leather", "wool", "polyester"],
                "fits": FITS, "price": (70, 260)},
    "hoodies": {"styles": ["casual", "sporty", "streetwear"], "materials": ["cotton", "polyester"],
                "fits": ["regular", "oversized"], "price": (35, 95)},
    "sneakers": {"styles": ["casual", "sporty", "streetwear"], "materials": ["leather", "polyester", "cotton"],
                 "fits": ["regular"], "price": (55, 180)},
    "formal-shoes": {"styles": ["formal", "classic"], "materials": ["leather"], "fits": ["regular"],
                     "price": (80, 240), "colors": ["black", "brown", "burgundy", "beige"]},
    "accessories": {"styles": ["casual", "classic", "formal", "streetwear", "sporty"],
                    "materials": ["leather", "polyester", "cotton", "wool"], "fits": ["regular"], "price": (15, 120)},
}

ACCESSORY_TYPES = {
    "cap": {"materials": ["cotton", "polyester"], "styles": ["casual", "sporty", "streetwear"], "price": (15, 40)},
    "bag": {"materials": ["leather", "polyester"], "styles": ["classic", "formal", "casual", "streetwear"], "price": (35, 160)},
    "belt": {"materials": ["leather"], "styles": ["classic", "formal", "casual"], "price": (20, 70),
             "colors": ["black", "brown", "burgundy", "beige"]},
    "scarf": {"materials": ["wool", "cotton", "linen"], "styles": ["classic", "casual", "formal"], "price": (20, 75)},
}

# How many products to generate per (gender, category)
TARGET_COUNTS: dict[tuple[str, str], int] = {
    ("men", "t-shirts"): 14, ("men", "shirts"): 14, ("men", "jeans"): 12, ("men", "trousers"): 10,
    ("men", "jackets"): 12, ("men", "hoodies"): 10, ("men", "sneakers"): 12, ("men", "formal-shoes"): 8,
    ("women", "t-shirts"): 12, ("women", "shirts"): 12, ("women", "jeans"): 12, ("women", "trousers"): 10,
    ("women", "dresses"): 16, ("women", "skirts"): 10, ("women", "jackets"): 12, ("women", "hoodies"): 8,
    ("women", "sneakers"): 10, ("women", "formal-shoes"): 8,
    ("kids", "t-shirts"): 8, ("kids", "jeans"): 6, ("kids", "hoodies"): 6, ("kids", "sneakers"): 6,
    ("unisex", "t-shirts"): 6, ("unisex", "hoodies"): 6, ("unisex", "sneakers"): 6, ("unisex", "accessories"): 20,
}

# Size systems
ADULT_CLOTHING_SIZES = ["XS", "S", "M", "L", "XL", "XXL"]
KIDS_CLOTHING_SIZES = ["4Y", "6Y", "8Y", "10Y", "12Y", "14Y"]
SHOE_SIZES = {
    "men": [str(s) for s in range(39, 47)],
    "women": [str(s) for s in range(36, 42)],
    "unisex": [str(s) for s in range(37, 46)],
    "kids": [str(s) for s in range(28, 36)],
}
ONE_SIZE = ["One Size"]
SHOE_CATEGORIES = {"sneakers", "formal-shoes"}


def sizes_for(gender: str, category: str) -> list[str]:
    if category == "accessories":
        return ONE_SIZE
    if category in SHOE_CATEGORIES:
        return SHOE_SIZES[gender]
    if gender == "kids":
        return KIDS_CLOTHING_SIZES
    return ADULT_CLOTHING_SIZES


ALL_SIZES: list[str] = (
    ADULT_CLOTHING_SIZES + KIDS_CLOTHING_SIZES
    + sorted({s for v in SHOE_SIZES.values() for s in v}, key=int) + ONE_SIZE
)


# Image key per (gender, category[, accessory type])
def image_key(gender: str, category: str, accessory_type: str | None = None) -> str:
    if category == "accessories":
        return f"acc-{accessory_type}"
    g = "men" if gender == "unisex" else gender
    mapping = {
        ("women", "shirts"): "women-blouse",
        ("men", "formal-shoes"): "men-formal-shoes",
        ("women", "formal-shoes"): "women-heels",
    }
    return mapping.get((g, category), f"{g}-{category}")


def image_url(key: str) -> str:
    return f"/products/{key}.{IMAGE_EXT}"


# Product naming vocabulary: category -> style -> nouns  (gender overrides allowed)
NOUNS: dict[str, dict[str, list[str]]] = {
    "t-shirts": {"casual": ["Crew Tee", "Pocket Tee", "Essential Tee"], "sporty": ["Performance Tee", "Training Tee"],
                 "streetwear": ["Graphic Tee", "Boxy Tee", "Heavyweight Tee"]},
    "shirts": {"formal": ["Poplin Dress Shirt", "Tailored Shirt"], "classic": ["Oxford Shirt", "Button-Down Shirt"],
               "casual": ["Camp-Collar Shirt", "Everyday Shirt"]},
    "jeans": {"casual": ["Straight Jeans", "Relaxed Jeans"], "streetwear": ["Baggy Jeans", "Carpenter Jeans"],
              "classic": ["Five-Pocket Jeans", "Selvedge Jeans"]},
    "trousers": {"formal": ["Suit Trousers", "Pleated Trousers"], "classic": ["Chinos", "Tapered Trousers"],
                 "casual": ["Drawstring Trousers", "Utility Pants"], "sporty": ["Track Pants", "Jogger Pants"]},
    "dresses": {"formal": ["Evening Dress", "Satin Midi Dress"], "casual": ["Sundress", "Shirt Dress", "T-Shirt Dress"],
                "classic": ["Wrap Dress", "A-Line Dress"]},
    "skirts": {"casual": ["Mini Skirt", "Tiered Skirt"], "classic": ["Pleated Midi Skirt", "A-Line Skirt"],
               "formal": ["Pencil Skirt", "Tailored Midi Skirt"]},
    "jackets": {"casual": ["Trucker Jacket", "Overshirt Jacket"], "classic": ["Trench Coat", "Peacoat"],
                "streetwear": ["Bomber Jacket", "Puffer Jacket"], "formal": ["Tailored Blazer", "Wool Blazer"],
                "sporty": ["Windbreaker", "Track Jacket"]},
    "hoodies": {"casual": ["Pullover Hoodie", "Zip Hoodie"], "sporty": ["Training Hoodie", "Tech Hoodie"],
                "streetwear": ["Oversized Hoodie", "Heavyweight Hoodie"]},
    "sneakers": {"casual": ["Low-Top Sneakers", "Canvas Sneakers"], "sporty": ["Running Shoes", "Trainers"],
                 "streetwear": ["Chunky Sneakers", "High-Top Sneakers"]},
    "formal-shoes": {"formal": ["Oxford Shoes", "Derby Shoes"], "classic": ["Loafers", "Chelsea Boots"]},
}
WOMEN_FORMAL_SHOE_NOUNS = {"formal": ["Pointed Heels", "Block Heels"], "classic": ["Ballet Flats", "Ankle Boots"]}
WOMEN_SHIRT_NOUNS = {"formal": ["Silk-Touch Blouse", "Tie-Neck Blouse"], "classic": ["Wrap Blouse", "Button Blouse"],
                     "casual": ["Relaxed Blouse", "Linen Blouse"]}
ACCESSORY_NOUNS = {"cap": ["Baseball Cap", "Bucket Hat", "Dad Cap"], "bag": ["Tote Bag", "Crossbody Bag", "Backpack"],
                   "belt": ["Leather Belt", "Reversible Belt"], "scarf": ["Knit Scarf", "Lightweight Scarf"]}

# Description fragments (help semantic search understand occasions/seasons)
STYLE_LINES = {
    "casual": ["An easy everyday piece for weekends, errands and relaxed hangouts.",
               "Laid-back and comfortable, made for daily wear."],
    "formal": ["Polished enough for the office, business meetings, weddings and evening events.",
               "A refined choice for formal occasions and smart dress codes."],
    "sporty": ["Built for the gym, running and active days, with sweat-wicking comfort.",
               "Athletic design that moves with you during workouts and sports."],
    "streetwear": ["Bold urban look inspired by street culture and skate style.",
                   "Statement streetwear piece for city days and nights out."],
    "classic": ["Timeless design that never goes out of style and pairs with everything.",
                "A wardrobe staple with heritage details and clean lines."],
}
MATERIAL_LINES = {
    "cotton": "Soft, breathable cotton that feels great all day.",
    "linen": "Lightweight linen keeps you cool on hot summer days.",
    "wool": "Warm wool blend for cold weather, cozy in autumn and winter.",
    "denim": "Durable denim that softens and gets better with every wear.",
    "leather": "Genuine leather with a rich finish that ages beautifully.",
    "polyester": "Quick-drying, lightweight technical fabric that resists wrinkles.",
}
FIT_LINES = {
    "slim": "Slim fit that follows the body for a sharp silhouette.",
    "regular": "Regular fit with a comfortable, true-to-size cut.",
    "oversized": "Oversized, relaxed fit for a loose, contemporary drape.",
}

# Outfit / styling knowledge
COMPLEMENTS: dict[str, list[str]] = {
    "t-shirts": ["jeans", "trousers", "jackets", "sneakers"],
    "shirts": ["trousers", "jeans", "formal-shoes", "jackets"],
    "jeans": ["t-shirts", "shirts", "jackets", "sneakers"],
    "trousers": ["shirts", "jackets", "formal-shoes", "accessories"],
    "dresses": ["jackets", "formal-shoes", "accessories"],
    "skirts": ["shirts", "t-shirts", "formal-shoes", "jackets"],
    "jackets": ["t-shirts", "jeans", "trousers", "sneakers"],
    "hoodies": ["jeans", "trousers", "sneakers", "accessories"],
    "sneakers": ["jeans", "t-shirts", "hoodies", "jackets"],
    "formal-shoes": ["trousers", "shirts", "jackets", "accessories"],
    "accessories": ["t-shirts", "jeans", "jackets", "sneakers"],
}
STYLE_COMPAT: dict[str, set[str]] = {
    "casual": {"casual", "classic", "streetwear"},
    "formal": {"formal", "classic"},
    "sporty": {"sporty", "casual", "streetwear"},
    "streetwear": {"streetwear", "casual", "sporty"},
    "classic": {"classic", "formal", "casual"},
}
NEUTRALS = {"black", "white", "navy", "grey", "beige", "indigo", "brown"}
COLOR_HARMONY: dict[str, set[str]] = {
    "olive": {"beige", "white", "brown", "black", "navy"},
    "green": {"beige", "white", "navy", "brown"},
    "burgundy": {"navy", "grey", "beige", "black", "white"},
    "red": {"black", "white", "navy", "indigo", "grey"},
    "pink": {"white", "grey", "navy", "light-blue", "beige"},
    "blue": {"white", "beige", "grey", "navy", "brown"},
    "light-blue": {"navy", "white", "beige", "grey", "indigo"},
    "yellow": {"navy", "white", "grey", "indigo", "black"},
}


def colors_match(a: str, b: str) -> bool:
    if a in NEUTRALS or b in NEUTRALS:
        return True
    return b in COLOR_HARMONY.get(a, set()) or a in COLOR_HARMONY.get(b, set())
