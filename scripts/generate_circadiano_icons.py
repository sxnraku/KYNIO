"""Gera os icones da app na identidade "Circadiano" (luz filtrada).

Paleta: papel #EDE6D3 / #E4DCC4, tinta #3A3A38, ambar #D9922E / brilho #F4C95D.
Motivo: ampulheta em traco de tinta com areia ambar e anel circadiano.

Uso: python scripts/generate_circadiano_icons.py
"""

import math
import os
import glob

from PIL import Image, ImageDraw, ImageFilter

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ASSETS = os.path.join(BASE_DIR, "assets", "images")

PAPER = (237, 230, 211)       # --paper
PAPER_DEEP = (228, 220, 196)  # --paper-deep
INK = (58, 58, 56)            # --ink-deep
AMBER = (217, 146, 46)        # --amber
AMBER_GLOW = (244, 201, 93)   # --amber-glow

SS = 4  # supersampling


def lerp(a, b, t):
    return tuple(int(a[i] + (b[i] - a[i]) * t) for i in range(3))


def make_background(size):
    """Papel com gradiente vertical e brilho ambar suave no topo ("luz filtrada")."""
    img = Image.new("RGB", (size, size))
    draw = ImageDraw.Draw(img)
    for y in range(size):
        t = y / size
        draw.line([(0, y), (size, y)], fill=lerp(PAPER, PAPER_DEEP, t))

    glow = Image.new("L", (size, size), 0)
    gdraw = ImageDraw.Draw(glow)
    r = int(size * 0.55)
    gdraw.ellipse(
        (size // 2 - r, -r // 2, size // 2 + r, r + r // 2), fill=110
    )
    glow = glow.filter(ImageFilter.GaussianBlur(size * 0.12))
    amber_layer = Image.new("RGB", (size, size), AMBER_GLOW)
    img = Image.composite(amber_layer, img, glow)
    return img


def hourglass_points(cx, top_y, bot_y, half_w, mid_y, samples=60):
    """Perfil curvo da ampulheta: lista de pontos de cada lado."""
    half_h = (bot_y - top_y) / 2
    left, right = [], []
    for i in range(samples + 1):
        y = top_y + (bot_y - top_y) * i / samples
        t = abs((y - mid_y) / half_h)  # 0 na cintura, 1 nos topos
        w = half_w * (0.18 + 0.82 * t ** 0.85)
        left.append((cx - w, y))
        right.append((cx + w, y))
    return left, right


def draw_mark(canvas, cx, cy, scale, stroke, with_ring=True, monochrome=False):
    """Desenha ampulheta + anel centrados em (cx, cy). scale=1 para canvas 1024."""
    draw = ImageDraw.Draw(canvas)

    amber = INK if monochrome else AMBER
    amber_glow = INK if monochrome else AMBER_GLOW

    top_y = cy - 300 * scale
    bot_y = cy + 300 * scale
    mid_y = cy
    half_w = 190 * scale
    bar_w = 250 * scale
    bar_h = 34 * scale

    if with_ring:
        # Anel circadiano: arco fino em volta, aberto em baixo, com "sol" ambar
        ring_r = 400 * scale
        bbox = (cx - ring_r, cy - ring_r, cx + ring_r, cy + ring_r)
        draw.arc(bbox, start=-35, end=215, fill=amber, width=max(2, int(10 * scale)))
        sun_r = 26 * scale
        sun_x = cx + ring_r * math.cos(math.radians(-35))
        sun_y = cy + ring_r * math.sin(math.radians(-35))
        draw.ellipse(
            (sun_x - sun_r, sun_y - sun_r, sun_x + sun_r, sun_y + sun_r),
            fill=amber_glow,
        )

    left, right = hourglass_points(cx, top_y, bot_y, half_w, mid_y)
    w = max(2, int(stroke))

    # Corpo: traco de tinta dos dois lados
    draw.line(left, fill=INK, width=w, joint="curve")
    draw.line(right, fill=INK, width=w, joint="curve")

    # Barras topo/fundo com pontas redondas
    for bar_y in (top_y, bot_y):
        draw.rounded_rectangle(
            (cx - bar_w, bar_y - bar_h / 2, cx + bar_w, bar_y + bar_h / 2),
            radius=bar_h / 2,
            fill=INK,
        )

    # Areia: monte solido no fundo (base larga + cume central)
    half_h = (bot_y - top_y) / 2

    def wall_w(y):
        t = abs((y - mid_y) / half_h)
        return half_w * (0.18 + 0.82 * t ** 0.85) - w

    sand_base_h = 70 * scale
    sand_peak = 80 * scale
    w0 = wall_w(bot_y - 4 * scale)
    w1 = wall_w(bot_y - sand_base_h)
    sand_top_y = bot_y - sand_base_h - sand_peak
    draw.polygon(
        [
            (cx - w0, bot_y),
            (cx + w0, bot_y),
            (cx + w1, bot_y - sand_base_h),
            (cx, sand_top_y),
            (cx - w1, bot_y - sand_base_h),
        ],
        fill=amber,
    )

    # Fio de areia a cair ate ao cume do monte
    draw.line([(cx, mid_y - 30 * scale), (cx, sand_top_y + 8 * scale)],
              fill=amber, width=max(2, int(6 * scale)))
    # Camara superior: areia restante (triângulo suave)
    top_sand_h = 70 * scale
    draw.polygon(
        [
            (cx - half_w * 0.45, top_y + top_sand_h + 40 * scale),
            (cx + half_w * 0.45, top_y + top_sand_h + 40 * scale),
            (cx, mid_y - 34 * scale),
        ],
        fill=amber,
    )


def build_master(size=1024):
    img = make_background(size * SS).convert("RGBA")
    layer = Image.new("RGBA", img.size, (0, 0, 0, 0))
    draw_mark(layer, img.size[0] // 2, img.size[1] // 2, scale=SS, stroke=22 * SS)
    img.alpha_composite(layer)
    return img.resize((size, size), Image.Resampling.LANCZOS)


def build_foreground(size=1024):
    """Foreground adaptativo: so a marca, ~60% do canvas, transparente."""
    fg = Image.new("RGBA", (size * SS, size * SS), (0, 0, 0, 0))
    draw_mark(fg, fg.size[0] // 2, fg.size[1] // 2, scale=SS * 0.55,
              stroke=26 * SS, with_ring=False)
    return fg.resize((size, size), Image.Resampling.LANCZOS)


def build_monochrome(size=1024):
    fg = Image.new("RGBA", (size * SS, size * SS), (0, 0, 0, 0))
    draw_mark(fg, fg.size[0] // 2, fg.size[1] // 2, scale=SS * 0.55,
              stroke=26 * SS, with_ring=False, monochrome=True)
    return fg.resize((size, size), Image.Resampling.LANCZOS)


def main():
    os.makedirs(ASSETS, exist_ok=True)
    master = build_master()
    master.save(os.path.join(ASSETS, "icon-kynio-v1.png"), "PNG")
    master.save(os.path.join(ASSETS, "icon.png"), "PNG")

    favicon = master.resize((512, 512), Image.Resampling.LANCZOS)
    favicon.save(os.path.join(ASSETS, "favicon.png"), "PNG")

    legal_assets = os.path.join(BASE_DIR, "legal-site", "assets")
    if os.path.isdir(legal_assets):
        favicon.save(os.path.join(legal_assets, "app-icon-512x512.png"), "PNG")

    build_foreground().save(os.path.join(ASSETS, "android-icon-foreground.png"), "PNG")
    make_background(1024).convert("RGBA").save(
        os.path.join(ASSETS, "android-icon-background.png"), "PNG"
    )
    build_monochrome().save(os.path.join(ASSETS, "android-icon-monochrome.png"), "PNG")

    splash = build_foreground(300)
    splash.save(os.path.join(ASSETS, "splash-icon.png"), "PNG")

    # Mipmaps Android (apenas webp; PNGs duplicados causam conflito de recursos)
    res_dir = os.path.join(BASE_DIR, "android", "app", "src", "main", "res")
    for png_file in glob.glob(os.path.join(res_dir, "mipmap-*", "*.png")):
        os.remove(png_file)

    foreground = build_foreground()
    densities = {
        "mipmap-mdpi": (48, 108),
        "mipmap-hdpi": (72, 162),
        "mipmap-xhdpi": (96, 216),
        "mipmap-xxhdpi": (144, 324),
        "mipmap-xxxhdpi": (192, 432),
    }
    for folder, (launcher_size, fg_size) in densities.items():
        folder_path = os.path.join(res_dir, folder)
        os.makedirs(folder_path, exist_ok=True)

        launcher_img = master.resize((launcher_size, launcher_size), Image.Resampling.LANCZOS)
        launcher_img.save(os.path.join(folder_path, "ic_launcher.webp"), "WEBP", quality=95)

        mask = Image.new("L", (launcher_size, launcher_size), 0)
        ImageDraw.Draw(mask).ellipse((0, 0, launcher_size, launcher_size), fill=255)
        round_img = Image.new("RGBA", (launcher_size, launcher_size), (0, 0, 0, 0))
        round_img.paste(launcher_img, (0, 0), mask)
        round_img.save(os.path.join(folder_path, "ic_launcher_round.webp"), "WEBP", quality=95)

        fg_mip = foreground.resize((fg_size, fg_size), Image.Resampling.LANCZOS)
        fg_mip.save(os.path.join(folder_path, "ic_launcher_foreground.webp"), "WEBP", quality=95)

    print("Icones Circadiano gerados em", ASSETS)


if __name__ == "__main__":
    main()
