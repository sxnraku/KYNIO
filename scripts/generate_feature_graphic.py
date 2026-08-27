import os
from PIL import Image, ImageDraw, ImageFont, ImageFilter

def create_feature_graphic_en_hd():
    width, height = 1024, 500
    canvas = Image.new("RGB", (width, height), (12, 12, 14)) # #0C0C0E
    
    # Load crisp Windows TrueType fonts
    font_title = ImageFont.truetype("C:/Windows/Fonts/segoeuib.ttf", 64)
    font_tagline = ImageFont.truetype("C:/Windows/Fonts/segoeuib.ttf", 26)
    font_desc = ImageFont.truetype("C:/Windows/Fonts/segoeui.ttf", 18)
    font_pill = ImageFont.truetype("C:/Windows/Fonts/segoeuib.ttf", 16)
    
    # Ambient radial green glow in the background
    glow = Image.new("RGBA", (width, height), (0, 0, 0, 0))
    g_draw = ImageDraw.Draw(glow)
    
    # Right side glow behind the icon
    g_draw.ellipse([(580, 20), (980, 480)], fill=(16, 185, 129, 45))
    glow = glow.filter(ImageFilter.GaussianBlur(70))
    
    canvas = Image.alpha_composite(canvas.convert("RGBA"), glow).convert("RGB")
    draw = ImageDraw.Draw(canvas)
    
    # Left Content: Title & Tagline in English
    draw.text((60, 65), "KYNIO", fill=(255, 255, 255), font=font_title)
    draw.text((60, 145), "Intermittent Fasting & Longevity", fill=(16, 185, 129), font=font_tagline)
    draw.text((60, 190), "Smart fasting tracker, custom routines & metabolic progress.", fill=(161, 161, 170), font=font_desc)
    
    # Feature Pills in English (large, clean, bold)
    pills = [
        "✦ Custom Fasting Schedules & ADF (36h)",
        "✦ Weight & Progress Analytics",
        "✦ Smart Reminders & Notifications"
    ]
    
    pill_y = 250
    for pill in pills:
        pill_w = 460
        pill_h = 44
        draw.rounded_rectangle([(60, pill_y), (60 + pill_w, pill_y + pill_h)], radius=22, fill=(24, 24, 27), outline=(45, 45, 48))
        draw.text((80, pill_y + 11), pill, fill=(244, 244, 245), font=font_pill)
        pill_y += 56
        
    # Right Side: Large App Icon Card
    icon_src = r"c:\Users\renat\Desktop\jejumaura\preview_icons\opcao_hourglass_flat.jpg"
    if os.path.exists(icon_src):
        icon_img = Image.open(icon_src).convert("RGBA")
        icon_size = 320
        icon_img = icon_img.resize((icon_size, icon_size), Image.Resampling.LANCZOS)
        
        # Mask with squircle rounded corners
        mask = Image.new("L", (icon_size, icon_size), 0)
        m_draw = ImageDraw.Draw(mask)
        m_draw.rounded_rectangle([(0, 0), (icon_size, icon_size)], radius=72, fill=255)
        
        icon_squircle = Image.new("RGBA", (icon_size, icon_size), (0, 0, 0, 0))
        icon_squircle.paste(icon_img, (0, 0), mask)
        
        # Drop shadow
        shadow = Image.new("RGBA", (icon_size + 60, icon_size + 60), (0, 0, 0, 0))
        s_draw = ImageDraw.Draw(shadow)
        s_draw.rounded_rectangle([(30, 30), (icon_size + 30, icon_size + 30)], radius=72, fill=(0, 0, 0, 180))
        shadow = shadow.filter(ImageFilter.GaussianBlur(24))
        
        icon_x = 610
        icon_y = (height - icon_size) // 2
        
        canvas_rgba = canvas.convert("RGBA")
        canvas_rgba.paste(shadow, (icon_x - 30, icon_y - 20), shadow)
        canvas_rgba.paste(icon_squircle, (icon_x, icon_y), icon_squircle)
        
        # Icon subtle border
        b_draw = ImageDraw.Draw(canvas_rgba)
        b_draw.rounded_rectangle([(icon_x, icon_y), (icon_x + icon_size, icon_y + icon_size)], radius=72, outline=(255, 255, 255, 35), width=2)
        
        canvas = canvas_rgba.convert("RGB")
        
    out1 = r"c:\Users\renat\Desktop\jejumaura\legal-site\assets\feature-graphic-1024x500.png"
    out2 = r"c:\Users\renat\Desktop\jejumaura\preview_icons\feature-graphic-1024x500.png"
    canvas.save(out1, "PNG")
    canvas.save(out2, "PNG")
    print("Large-text English Feature Graphic saved successfully to:", out1)

if __name__ == "__main__":
    create_feature_graphic_en_hd()
