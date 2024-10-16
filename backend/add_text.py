from PIL import Image, ImageDraw, ImageFont
import re

def add_text_to_panel(text, panel_image):
    # Generate text image based on input text
    text_image = generate_text_image(text)
    
    # Create a new image with extra space for text below the panel
    result_image = Image.new('RGB', (panel_image.width, panel_image.height + text_image.height))
    
    # Paste the original panel and text onto the new image
    result_image.paste(panel_image, (0, 0))
    result_image.paste(text_image, (0, panel_image.height))
    
    return result_image

def generate_text_image(text):
    width = 1024
    height = 128
    
    # Create a white background for the text
    image = Image.new('RGB', (width, height), color='white')
    draw = ImageDraw.Draw(image)
    
    # Load an appropriate font
    font = load_font(text, 30)
    
    # Calculate text size and position
    text_bbox = draw.textbbox((0, 0), text, font=font)
    text_width = text_bbox[2] - text_bbox[0]
    text_height = text_bbox[3] - text_bbox[1]
    x = (width - text_width) // 2
    y = (height - text_height) // 2
    
    # Define text color (black)
    text_color = (0, 0, 0)
    
    # Draw the text
    draw.text((x, y), text, fill=text_color, font=font)
    
    return image

def load_font(text, font_size):
    # Load appropriate font based on the content (handles Thai or other multilingual text)
    try:
        if contains_thai(text):
            font = ImageFont.truetype("NotoSansThai.ttf", font_size)  # Ensure this font is installed
        else:
            font = ImageFont.truetype("NotoSansSC-Regular.ttf", font_size)  # Fallback for other languages
    except IOError:
        print("Font file not found. Using default font.")
        font = ImageFont.load_default()  # Load default font if custom fonts are unavailable
    return font

def contains_thai(text):
    # Check if the text contains Thai characters
    return bool(re.search(r'[\u0E00-\u0E7F]', text))

# Example usage:
# panel_image = Image.open("panel1.png")  # Load an existing image
# text = "Vincent: I think we need a new product.\nAdrien: Let's brainstorm some ideas."
# result = add_text_to_panel(text, panel_image)
# result.save('panel1-text.png')
