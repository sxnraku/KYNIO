"""Gera a feature graphic 1024x500 (Play Store / OG) na identidade "Circadiano".

Paleta: papel #EDE6D3 / #E4DCC4, tinta #3A3A38, ambar #D9922E / brilho #F4C95D.
Usa o icone oficial assets/images/icon-kynio-v1.png.

Uso: python scripts/generate_feature_graphic.py
"""

import os

from PIL import Image, ImageDraw, ImageFilter, ImageFont

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

PAPER = (237, 230, 211)
PAPER_DEEP = (228, 220, 196)
INK = (58, 58, 56)
MUTED = (122, 114, 99)
AMBER = (217, 146, 46)
AMBER_GLOW = (244, 201, 93)


def create_feature_graphic():
    width, height = 1024, 500

    # Fundo papel com gradiente vertical suave
    canvas = Image.new("RGB", (width, height))
    cdraw = ImageDraw.Draw(canvas)
    for y in range(height):
        t = y / height
        cdraw.line(
            [(0, y), (width, y)],
            fill=tuple(int(PAPER[i] + (PAPER_DEEP[i] - PAPER[i]) * t) for i in range(3)),
        )

    # Brilho ambar suave atras do icone ("luz filtrada")
    glow = Image.new("RGBA", (width, height), (0, 0, 0, 0))
    g_draw = ImageDraw.Draw(glow)
    g_draw.ellipse([(560, -60), (1060, 440)], fill=(*AMBER_GLOW, 90))
    glow = glow.filter(ImageFilter.GaussianBlur(80))
    canvas = Image.alpha_composite(canvas.convert("RGBA"), glow).convert("RGB")
    draw = ImageDraw.Draw(canvas)

    font_title = ImageFont.truetype("C:/Windows/Fonts/segoeuib.ttf", 64)
    font_tagline = ImageFont.truetype("C:/Windows/Fonts/segoeuib.ttf", 26)
    font_desc = ImageFont.truetype("C:/Windows/Fonts/segoeui.ttf", 18)
    font_pill = ImageFont.truetype("C:/Windows/Fonts/segoeuib.ttf", 16)

    draw.text((60, 65), "KYNIO", fill=INK, font=font_title)
    draw.text((60, 145), "Intermittent Fasting & Longevity", fill=AMBER, font=font_tagline)
    draw.text(
        (60, 190),
        "Smart fasting tracker, custom routines & metabolic progress.",
        fill=MUTED,
        font=font_desc,
    )

    pills = [
        "• Custom Fasting Schedules & ADF (36h)",
        "• Weight & Progress Analytics",
        "• Smart Reminders & Notifications",
    ]
    pill_y = 250
    for pill in pills:
        pill_w = 460
        pill_h = 44
        draw.rounded_rectangle(
            [(60, pill_y), (60 + pill_w, pill_y + pill_h)],
            radius=22,
            fill=PAPER_DEEP,
            outline=(216, 205, 178),
        )
        draw.text((80, pill_y + 11), pill, fill=INK, font=font_pill)
        pill_y += 56

    # Icone oficial com cantos squircle
    icon_src = os.path.join(BASE_DIR, "assets", "images", "icon-kynio-v1.png")
    if os.path.exists(icon_src):
        icon_img = Image.open(icon_src).convert("RGBA")
        icon_size = 320
        icon_img = icon_img.resize((icon_size, icon_size), Image.Resampling.LANCZOS)

        mask = Image.new("L", (icon_size, icon_size), 0)
        ImageDraw.Draw(mask).rounded_rectangle(
            [(0, 0), (icon_size, icon_size)], radius=72, fill=255
        )
        icon_squircle = Image.new("RGBA", (icon_size, icon_size), (0, 0, 0, 0))
        icon_squircle.paste(icon_img, (0, 0), mask)

        shadow = Image.new("RGBA", (icon_size + 60, icon_size + 60), (0, 0, 0, 0))
        ImageDraw.Draw(shadow).rounded_rectangle(
            [(30, 30), (icon_size + 30, icon_size + 30)],
            radius=72,
            fill=(58, 58, 56, 70),
        )
        shadow = shadow.filter(ImageFilter.GaussianBlur(24))

        icon_x = 610
        icon_y = (height - icon_size) // 2
        canvas_rgba = canvas.convert("RGBA")
        canvas_rgba.paste(shadow, (icon_x - 30, icon_y - 20), shadow)
        canvas_rgba.paste(icon_squircle, (icon_x, icon_y), icon_squircle)
        ImageDraw.Draw(canvas_rgba).rounded_rectangle(
            [(icon_x, icon_y), (icon_x + icon_size, icon_y + icon_size)],
            radius=72,
            outline=(58, 58, 56, 45),
            width=2,
        )
        canvas = canvas_rgba.convert("RGB")

    out1 = os.path.join(BASE_DIR, "legal-site", "assets", "feature-graphic-1024x500.png")
    out2 = os.path.join(BASE_DIR, "preview_icons", "feature-graphic-1024x500.png")
    canvas.save(out1, "PNG")
    canvas.save(out2, "PNG")
    print("Feature graphic Circadiano gravada em:", out1)


if __name__ == "__main__":
    create_feature_graphic()
