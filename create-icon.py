from PIL import Image, ImageDraw
import os

# Create a simple tomato-like icon
def create_pomodoro_icon(size):
    # Create a new image with transparent background
    img = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    
    # Draw tomato body (red circle)
    margin = size // 8
    draw.ellipse([margin, margin + size//6, size - margin, size - margin], 
                 fill=(220, 50, 50, 255))
    
    # Draw tomato top (green)
    top_height = size // 4
    draw.ellipse([size//3, margin, 2*size//3, margin + top_height], 
                 fill=(50, 150, 50, 255))
    
    return img

# Create icons directory if it doesn't exist
icons_dir = "src-tauri/icons"
os.makedirs(icons_dir, exist_ok=True)

# Create different sized icons
sizes = [32, 128, 256, 512]
for size in sizes:
    icon = create_pomodoro_icon(size)
    if size == 128:
        # Save both regular and @2x version
        icon.save(f"{icons_dir}/{size}x{size}.png")
        icon.save(f"{icons_dir}/{size}x{size}@2x.png")
    else:
        icon.save(f"{icons_dir}/{size}x{size}.png")

# Create ICO file for Windows (using 32x32 as base)
icon_32 = create_pomodoro_icon(32)
icon_32.save(f"{icons_dir}/icon.ico", format='ICO')

# Create ICNS file for macOS (using 512x512 as base)
icon_512 = create_pomodoro_icon(512)
icon_512.save(f"{icons_dir}/icon.icns", format='ICNS')

print("Icons created successfully!")
