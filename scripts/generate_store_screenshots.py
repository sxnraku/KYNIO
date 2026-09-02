"""Gera screenshots "destaque" (framed) para a Play Store a partir dos shots diretos.

Layout 1080x1920: fundo escuro quente com gradiente, pill âmbar, título + subtítulo,
e o screenshot dentro de uma moldura de telemóvel com cantos arredondados.

Uso: python scripts/generate_store_screenshots.py
"""

from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parent.parent
DIRETOS_PT = ROOT / "store/google-play/screenshots/diretos_1080x1920"
DIRETOS_EN = ROOT / "store/google-play/screenshots/diretos_en_US"
OUT_PT = ROOT / "store/google-play/screenshots/destaque_play_store"
OUT_EN = ROOT / "store/google-play/screenshots/destaque_en_US"

W, H = 1080, 1920
ACCENT = (240, 163, 60)  # âmbar Circadiano
BG_TOP = (26, 22, 16)
BG_BOTTOM = (10, 9, 8)
TITLE_COLOR = (245, 241, 234)
SUB_COLOR = (163, 158, 147)
FRAME_FILL = (20, 17, 13)
FRAME_BORDER = (58, 51, 43)

TITLE_FONT = ImageFont.truetype("C:/Windows/Fonts/segoeuib.ttf", 56)
SUB_FONT = ImageFont.truetype("C:/Windows/Fonts/segoeui.ttf", 30)

FRAME_BOX = (150, 326, 930, 1872)  # x0, y0, x1, y1
FRAME_RADIUS = 48
INNER_PAD = 8

PT = [
    ("00_jejum_tracker.png", "Tracker de Jejum Inteligente",
     "Temporizador adaptativo, objetivos flexíveis e fases"),
    ("01_refeicoes_nutricao_ia.png", "Análise de Refeições com IA",
     "Estimativas instantâneas de calorias e macronutrientes"),
    ("02_treinos_movimento.png", "Movimento ao Teu Ritmo",
     "Regista atividades, ganha XP e acompanha a semana"),
    ("03_progresso_gamificado.png", "Progresso & Níveis de XP",
     "Evolução calculada apenas pelos teus registos locais"),
    ("04_conquistas_partilha.png", "Conquistas & Partilha",
     "Cartões visuais para celebrares cada marco alcançado"),
    ("05_perfil_privacidade.png", "Privacidade Local-First",
     "Os teus dados guardados de forma 100% segura no teu telemóvel"),
]

EN = [
    ("00_fasting_tracker.png", "Smart Fasting Tracker",
     "Adaptive timer, custom protocols & metabolic phases"),
    ("01_ai_meal_nutrition.png", "AI Meal Analysis",
     "Instant calorie & macro estimates with manual review"),
    ("02_workouts_movement.png", "Move at Your Own Pace",
     "Log activities, earn XP and track weekly habits"),
    ("03_gamified_progress.png", "Progress & XP Levels",
     "Gentle gamification powered by 100% local records"),
    ("04_achievements_share.png", "Celebrate Milestones",
     "Clean visual milestone cards ready to share"),
    ("05_profile_privacy.png", "100% Local-First Privacy",
     "Your health & fasting data never leaves your device"),
]


def gradient_bg() -> Image.Image:
    img = Image.new("RGB", (W, H))
    for y in range(H):
        t = y / H
        img.paste(tuple(int(BG_TOP[i] + (BG_BOTTOM[i] - BG_TOP[i]) * t) for i in range(3)),
                  (0, y, W, y + 1))
    return img


def rounded_paste(base: Image.Image, shot: Image.Image, box, radius: int) -> None:
    x0, y0, x1, y1 = box
    w, h = x1 - x0, y1 - y0
    shot = shot.resize((w, h), Image.LANCZOS)
    mask = Image.new("L", (w, h), 0)
    ImageDraw.Draw(mask).rounded_rectangle((0, 0, w, h), radius=radius, fill=255)
    base.paste(shot, (x0, y0), mask)


def render(shot_path: Path, title: str, subtitle: str, out_path: Path) -> None:
    canvas = gradient_bg()
    draw = ImageDraw.Draw(canvas)

    # Pill âmbar
    draw.rounded_rectangle((64, 72, 232, 118), radius=23, fill=ACCENT)

    # Título + subtítulo
    draw.text((64, 150), title, font=TITLE_FONT, fill=TITLE_COLOR)
    draw.text((64, 232), subtitle, font=SUB_FONT, fill=SUB_COLOR)

    # Moldura do telemóvel
    fx0, fy0, fx1, fy1 = FRAME_BOX
    draw.rounded_rectangle(FRAME_BOX, radius=FRAME_RADIUS,
                           fill=FRAME_FILL, outline=FRAME_BORDER, width=3)

    # Screenshot dentro da moldura
    shot = Image.open(shot_path).convert("RGB")
    rounded_paste(canvas, shot,
                  (fx0 + INNER_PAD, fy0 + INNER_PAD, fx1 - INNER_PAD, fy1 - INNER_PAD),
                  radius=FRAME_RADIUS - INNER_PAD)

    canvas.save(out_path)
    print(out_path.name, "ok")


def main() -> None:
    for name, title, sub in PT:
        render(DIRETOS_PT / name, title, sub, OUT_PT / name)
    for name, title, sub in EN:
        render(DIRETOS_EN / name, title, sub, OUT_EN / name)


if __name__ == "__main__":
    main()
