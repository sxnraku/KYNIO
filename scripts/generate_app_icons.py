import os
import glob
from PIL import Image, ImageOps, ImageDraw

def generate_icons():
    src_path = r"c:\Users\renat\Desktop\jejumaura\preview_icons\opcao_hourglass_flat.jpg"
    base_dir = r"c:\Users\renat\Desktop\jejumaura"
    
    if not os.path.exists(src_path):
        print("Source image not found:", src_path)
        return
        
    img = Image.open(src_path).convert("RGBA")
    
    # 1. Base 1024x1024
    icon_1024 = img.resize((1024, 1024), Image.Resampling.LANCZOS)
    
    # Save standard icon files
    assets_images = os.path.join(base_dir, "assets", "images")
    os.makedirs(assets_images, exist_ok=True)
    
    icon_1024.save(os.path.join(assets_images, "icon-kynio-v1.png"), "PNG")
    icon_1024.save(os.path.join(assets_images, "icon.png"), "PNG")
    
    # Favicon 512x512
    favicon_512 = img.resize((512, 512), Image.Resampling.LANCZOS)
    favicon_512.save(os.path.join(assets_images, "favicon.png"), "PNG")
    
    # Legal site icon
    legal_assets = os.path.join(base_dir, "legal-site", "assets")
    if os.path.exists(legal_assets):
        favicon_512.save(os.path.join(legal_assets, "app-icon-512x512.png"), "PNG")
        
    # Adaptive icon foreground (safe zone: icon scaled to 72% centered on transparent canvas)
    fg_canvas = Image.new("RGBA", (1024, 1024), (0, 0, 0, 0))
    fg_size = int(1024 * 0.76)
    fg_scaled = img.resize((fg_size, fg_size), Image.Resampling.LANCZOS)
    offset = (1024 - fg_size) // 2
    fg_canvas.paste(fg_scaled, (offset, offset))
    fg_canvas.save(os.path.join(assets_images, "android-icon-foreground.png"), "PNG")
    
    # Adaptive icon background
    bg_canvas = Image.new("RGBA", (1024, 1024), (18, 18, 20, 255)) # #121214
    bg_canvas.save(os.path.join(assets_images, "android-icon-background.png"), "PNG")
    
    # Android mipmap densities (ONLY WEBP to avoid duplicate resource conflict)
    res_dir = os.path.join(base_dir, "android", "app", "src", "main", "res")
    
    # First, clean any png files in mipmap folders
    for png_file in glob.glob(os.path.join(res_dir, "mipmap-*", "*.png")):
        try:
            os.remove(png_file)
            print("Removed duplicate:", png_file)
        except Exception as e:
            print("Could not remove:", png_file, e)
            
    densities = {
        "mipmap-mdpi": (48, 108),
        "mipmap-hdpi": (72, 162),
        "mipmap-xhdpi": (96, 216),
        "mipmap-xxhdpi": (144, 324),
        "mipmap-xxxhdpi": (192, 432)
    }
    
    for folder, (launcher_size, fg_size) in densities.items():
        folder_path = os.path.join(res_dir, folder)
        if not os.path.exists(folder_path):
            os.makedirs(folder_path, exist_ok=True)
            
        # Standard launcher (square / rounded)
        launcher_img = img.resize((launcher_size, launcher_size), Image.Resampling.LANCZOS)
        launcher_img.save(os.path.join(folder_path, "ic_launcher.webp"), "WEBP", quality=95)
        
        # Round launcher
        mask = Image.new("L", (launcher_size, launcher_size), 0)
        draw = ImageDraw.Draw(mask)
        draw.ellipse((0, 0, launcher_size, launcher_size), fill=255)
        round_img = Image.new("RGBA", (launcher_size, launcher_size), (0, 0, 0, 0))
        round_img.paste(launcher_img, (0, 0), mask)
        round_img.save(os.path.join(folder_path, "ic_launcher_round.webp"), "WEBP", quality=95)
        
        # Adaptive foreground
        fg_mip = Image.new("RGBA", (fg_size, fg_size), (0, 0, 0, 0))
        scaled_icon = img.resize((int(fg_size * 0.76), int(fg_size * 0.76)), Image.Resampling.LANCZOS)
        fg_offset = (fg_size - scaled_icon.width) // 2
        fg_mip.paste(scaled_icon, (fg_offset, fg_offset))
        fg_mip.save(os.path.join(folder_path, "ic_launcher_foreground.webp"), "WEBP", quality=95)
        
    print("All icons successfully generated and duplicate PNGs cleaned!")

if __name__ == "__main__":
    generate_icons()
