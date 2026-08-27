import os
from PIL import Image, ImageDraw, ImageFont, ImageFilter

def create_mockup():
    width, height = 1080, 1920
    canvas = Image.new("RGBA", (width, height), (15, 17, 23, 255))
    
    # Background gradient / subtle wallpaper
    draw = ImageDraw.Draw(canvas)
    for y in range(height):
        r = int(12 + (y / height) * 16)
        g = int(14 + (y / height) * 20)
        b = int(22 + (y / height) * 28)
        draw.line([(0, y), (width, y)], fill=(r, g, b, 255))
        
    # Top Status Bar
    draw.text((80, 60), "18:45", fill=(255, 255, 255, 240), font=None)
    draw.text((920, 60), "5G  100%", fill=(255, 255, 255, 240), font=None)
    
    # Grid config
    start_x, start_y = 110, 260
    icon_size = 180
    gap_x = (width - 2 * start_x - 4 * icon_size) // 3
    gap_y = 80
    corner_radius = 42
    
    def make_squircle(img, size, radius):
        img_resized = img.resize((size, size), Image.Resampling.LANCZOS).convert("RGBA")
        mask = Image.new("L", (size, size), 0)
        mask_draw = ImageDraw.Draw(mask)
        mask_draw.rounded_rectangle([(0, 0), (size, size)], radius=radius, fill=255)
        output = Image.new("RGBA", (size, size), (0, 0, 0, 0))
        output.paste(img_resized, (0, 0), mask)
        return output

    def make_placeholder_icon(color, label_symbol):
        img = Image.new("RGBA", (icon_size, icon_size), color)
        d = ImageDraw.Draw(img)
        d.text((icon_size//2 - 10, icon_size//2 - 10), label_symbol, fill=(255, 255, 255, 220))
        return make_squircle(img, icon_size, corner_radius)

    # Load KYNIO icon
    kynio_src = r"c:\Users\renat\Desktop\jejumaura\preview_icons\opcao_hourglass_flat.jpg"
    kynio_raw = Image.open(kynio_src)
    kynio_icon = make_squircle(kynio_raw, icon_size, corner_radius)
    
    apps = [
        # Row 1
        ("Fotos", make_placeholder_icon((235, 87, 87, 255), "🖼")),
        ("Câmara", make_placeholder_icon((50, 50, 55, 255), "📷")),
        ("Mapas", make_placeholder_icon((46, 204, 113, 255), "📍")),
        ("Definições", make_placeholder_icon((120, 125, 135, 255), "⚙")),
        # Row 2
        ("Spotify", make_placeholder_icon((30, 215, 96, 255), "🎵")),
        ("WhatsApp", make_placeholder_icon((37, 211, 102, 255), "💬")),
        ("KYNIO", kynio_icon),
        ("Saúde", make_placeholder_icon((255, 75, 110, 255), "❤️")),
        # Row 3
        ("Calendário", make_placeholder_icon((245, 245, 247, 255), "📅")),
        ("Relógio", make_placeholder_icon((28, 28, 30, 255), "⏰")),
        ("Notas", make_placeholder_icon((250, 200, 30, 255), "📝")),
        ("Fitness", make_placeholder_icon((16, 185, 129, 255), "🏃")),
    ]
    
    for idx, (app_name, icon_img) in enumerate(apps):
        row = idx // 4
        col = idx % 4
        x = start_x + col * (icon_size + gap_x)
        y = start_y + row * (icon_size + gap_y + 40)
        
        # Shadow
        shadow = Image.new("RGBA", (icon_size + 20, icon_size + 20), (0, 0, 0, 0))
        s_draw = ImageDraw.Draw(shadow)
        s_draw.rounded_rectangle([(10, 10), (icon_size + 10, icon_size + 10)], radius=corner_radius, fill=(0, 0, 0, 90))
        shadow = shadow.filter(ImageFilter.GaussianBlur(12))
        canvas.paste(shadow, (x - 10, y - 5), shadow)
        
        # Icon
        canvas.paste(icon_img, (x, y), icon_img)
        
        # Text label
        # Center text under icon
        text_bbox = draw.textbbox((0, 0), app_name)
        text_w = text_bbox[2] - text_bbox[0]
        text_x = x + (icon_size - text_w) // 2
        text_y = y + icon_size + 14
        
        # Highlight KYNIO label in vibrant white
        is_kynio = app_name == "KYNIO"
        color_text = (255, 255, 255, 255) if is_kynio else (220, 220, 230, 210)
        draw.text((text_x, text_y), app_name, fill=color_text)
        
    # Dock bar background at bottom
    dock_y = height - 260
    dock_box = [(60, dock_y), (width - 60, dock_y + 200)]
    dock_bg = Image.new("RGBA", (width, height), (0, 0, 0, 0))
    dock_draw = ImageDraw.Draw(dock_bg)
    dock_draw.rounded_rectangle(dock_box, radius=56, fill=(255, 255, 255, 30))
    canvas = Image.alpha_composite(canvas, dock_bg)
    
    # Dock apps
    dock_apps = [
        make_placeholder_icon((52, 120, 246, 255), "📞"),
        make_placeholder_icon((50, 140, 255, 255), "🌐"),
        make_placeholder_icon((90, 200, 250, 255), "✉️"),
        make_placeholder_icon((255, 149, 0, 255), "🎧"),
    ]
    for d_idx, d_icon in enumerate(dock_apps):
        d_x = start_x + d_idx * (icon_size + gap_x)
        d_y = dock_y + 10
        canvas.paste(d_icon, (d_x, d_y), d_icon)
        
    # Save mockup
    out_dir = r"C:\Users\renat\.gemini\antigravity-ide\brain\0475052b-4f9e-44cb-a395-c7dc45da78ea"
    out_path = os.path.join(out_dir, "homescreen_mockup.jpg")
    canvas.convert("RGB").save(out_path, "JPEG", quality=95)
    
    # Also save to preview_icons
    local_out = r"c:\Users\renat\Desktop\jejumaura\preview_icons\homescreen_mockup.jpg"
    canvas.convert("RGB").save(local_out, "JPEG", quality=95)
    print("Homescreen mockup created at:", out_path)

if __name__ == "__main__":
    create_mockup()
