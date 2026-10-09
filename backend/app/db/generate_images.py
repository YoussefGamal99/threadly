"""Generate 26 elegant studio fashion product images with Pillow."""
import math
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont, ImageFilter

OUT_DIR = Path("/home/eco/Projects/LangChain_Projects/threadly/frontend/public/products")
OUT_DIR.mkdir(parents=True, exist_ok=True)

# 26 product types with palettes and motifs
PRODUCT_TYPES = {
    "men-t-shirts": {"title": "Men's Classic Tee", "subtitle": "Essential Cotton Crew", "hue": (45, 52, 64), "accent": (212, 184, 135)},
    "men-shirts": {"title": "Men's Tailored Shirt", "subtitle": "Oxford & Poplin", "hue": (36, 48, 68), "accent": (198, 172, 126)},
    "men-jeans": {"title": "Men's Denim", "subtitle": "Straight & Relaxed Fit", "hue": (28, 42, 65), "accent": (160, 190, 225)},
    "men-trousers": {"title": "Men's Trousers", "subtitle": "Pleated & Chino Cut", "hue": (50, 48, 45), "accent": (210, 195, 170)},
    "men-jackets": {"title": "Men's Outerwear", "subtitle": "Blazers & Overshirts", "hue": (32, 34, 40), "accent": (205, 175, 120)},
    "men-hoodies": {"title": "Men's Fleece Hoodie", "subtitle": "Heavyweight Cotton", "hue": (40, 42, 48), "accent": (180, 185, 195)},
    "men-sneakers": {"title": "Men's Footwear", "subtitle": "Low-Top & Runners", "hue": (35, 38, 42), "accent": (220, 190, 130)},
    "men-formal-shoes": {"title": "Men's Dress Shoes", "subtitle": "Leather Oxfords & Loafers", "hue": (42, 28, 22), "accent": (215, 165, 105)},
    "women-t-shirts": {"title": "Women's Tee", "subtitle": "Soft Touch Cotton", "hue": (55, 45, 52), "accent": (225, 175, 185)},
    "women-blouse": {"title": "Women's Blouse", "subtitle": "Silk & Linen Silhouettes", "hue": (58, 50, 56), "accent": (230, 200, 190)},
    "women-jeans": {"title": "Women's Denim", "subtitle": "High-Rise & Flare Cuts", "hue": (30, 45, 70), "accent": (170, 200, 235)},
    "women-trousers": {"title": "Women's Trousers", "subtitle": "Tailored Wide-Leg", "hue": (48, 44, 42), "accent": (218, 195, 165)},
    "women-dresses": {"title": "Women's Dress", "subtitle": "Evening & Midi Elegance", "hue": (55, 35, 45), "accent": (235, 180, 160)},
    "women-skirts": {"title": "Women's Skirt", "subtitle": "Pleated & A-Line", "hue": (52, 40, 48), "accent": (220, 180, 190)},
    "women-jackets": {"title": "Women's Jacket", "subtitle": "Structured Blazers", "hue": (38, 36, 42), "accent": (215, 185, 135)},
    "women-hoodies": {"title": "Women's Hoodie", "subtitle": "Relaxed Lounge Fleece", "hue": (46, 42, 48), "accent": (205, 180, 200)},
    "women-sneakers": {"title": "Women's Sneakers", "subtitle": "Sport & Street Trainers", "hue": (42, 40, 46), "accent": (225, 195, 150)},
    "women-heels": {"title": "Women's Heels", "subtitle": "Pointed & Block Heels", "hue": (45, 30, 38), "accent": (230, 175, 140)},
    "kids-t-shirts": {"title": "Kids' Graphic Tee", "subtitle": "Durable Soft Cotton", "hue": (40, 55, 65), "accent": (235, 190, 100)},
    "kids-jeans": {"title": "Kids' Denim", "subtitle": "Flexible Stretch Jeans", "hue": (32, 48, 72), "accent": (150, 195, 230)},
    "kids-hoodies": {"title": "Kids' Pullover", "subtitle": "Cozy Warm Fleece", "hue": (45, 50, 60), "accent": (240, 160, 140)},
    "kids-sneakers": {"title": "Kids' Trainers", "subtitle": "Active Play Sneakers", "hue": (40, 45, 55), "accent": (225, 180, 110)},
    "acc-cap": {"title": "Headwear", "subtitle": "Canvas & Twill Caps", "hue": (38, 42, 48), "accent": (210, 185, 130)},
    "acc-bag": {"title": "Leather & Canvas Bag", "subtitle": "Tote & Crossbody", "hue": (45, 38, 32), "accent": (220, 180, 120)},
    "acc-belt": {"title": "Refined Belt", "subtitle": "Genuine Calfskin Leather", "hue": (42, 32, 26), "accent": (215, 170, 110)},
    "acc-scarf": {"title": "Knit Scarf", "subtitle": "Wool & Cashmere Blend", "hue": (48, 44, 46), "accent": (225, 190, 160)},
}

def create_card_image(name, meta):
    w, h = 800, 800
    img = Image.new("RGB", (w, h), (18, 19, 22))
    draw = ImageDraw.Draw(img)

    # 1. Subtle radial backdrop glow
    cx, cy = w // 2, h // 2 - 40
    hue = meta["hue"]
    accent = meta["accent"]

    for r in range(350, 50, -10):
        alpha = int((1 - r / 350) * 120)
        c = (
            min(255, int(hue[0] + (accent[0] - hue[0]) * 0.2 * (1 - r / 350))),
            min(255, int(hue[1] + (accent[1] - hue[1]) * 0.2 * (1 - r / 350))),
            min(255, int(hue[2] + (accent[2] - hue[2]) * 0.2 * (1 - r / 350))),
        )
        draw.ellipse([cx - r, cy - r, cx + r, cy + r], fill=c)

    # Apply soft blur to background
    img = img.filter(ImageFilter.GaussianBlur(radius=18))
    draw = ImageDraw.Draw(img)

    # 2. Geometric boutique pedestal / card frame
    draw.rounded_rectangle([70, 70, w - 70, h - 70], radius=24, outline=(42, 45, 52), width=2)
    draw.rounded_rectangle([90, 90, w - 90, h - 90], radius=18, outline=(min(255, hue[0] + 30), min(255, hue[1] + 30), min(255, hue[2] + 30)), width=1)

    # Studio pedestal oval
    draw.ellipse([cx - 240, cy + 180, cx + 240, cy + 260], fill=(24, 26, 30), outline=(50, 54, 62), width=2)
    draw.ellipse([cx - 200, cy + 195, cx + 200, cy + 245], fill=(30, 33, 38), outline=accent, width=1)

    # 3. Stylized Garment / Object Hanger Motif
    # Hanger apex
    draw.arc([cx - 30, cy - 180, cx + 30, cy - 120], start=180, end=0, fill=accent, width=4)
    draw.line([cx + 30, cy - 150, cx, cy - 110], fill=accent, width=4)
    # Hanger shoulder bar
    draw.line([cx - 160, cy - 60, cx, cy - 110], fill=accent, width=4)
    draw.line([cx, cy - 110, cx + 160, cy - 60], fill=accent, width=4)
    draw.line([cx - 160, cy - 60, cx + 160, cy - 60], fill=(70, 75, 85), width=3)

    # Silhouette drape
    drape_pts = [
        (cx - 140, cy - 50),
        (cx - 160, cy + 140),
        (cx - 110, cy + 160),
        (cx, cy + 150),
        (cx + 110, cy + 160),
        (cx + 160, cy + 140),
        (cx + 140, cy - 50),
    ]
    draw.polygon(drape_pts, fill=(min(255, hue[0] + 15), min(255, hue[1] + 15), min(255, hue[2] + 15)), outline=(70, 75, 85))

    # Center crease & collar
    draw.line([cx, cy - 50, cx, cy + 150], fill=(accent[0], accent[1], accent[2], 120), width=2)
    draw.polygon([(cx - 40, cy - 50), (cx, cy), (cx + 40, cy - 50)], outline=accent, fill=(24, 26, 30))

    # 4. Brand Watermark & Typography
    draw.text((cx, 120), "THREADLY ATELIER", fill=(180, 185, 195), anchor="mm")
    draw.line([cx - 80, 140, cx + 80, 140], fill=accent, width=1)

    # Bottom labels
    draw.text((cx, h - 170), meta["title"].upper(), fill=(245, 245, 247), anchor="mm")
    draw.text((cx, h - 130), meta["subtitle"], fill=accent, anchor="mm")
    draw.text((cx, h - 100), "CURATED LUXURY COLLECTION", fill=(120, 125, 135), anchor="mm")

    out_file = OUT_DIR / f"{name}.jpg"
    img.save(out_file, "JPEG", quality=92)

for name, meta in PRODUCT_TYPES.items():
    create_card_image(name, meta)

print(f"Generated {len(PRODUCT_TYPES)} product photos in {OUT_DIR}")
