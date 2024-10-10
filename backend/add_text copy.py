from PIL import Image, ImageDraw, ImageFont

def add_text_to_panel(text, panel_image):
    # Generate the text image with the same width as the panel image
    text_image = generate_text_image(text, panel_image.width)

    # Create a new image that can fit both the panel and the text below it
    result_image = Image.new('RGB', (panel_image.width, panel_image.height + text_image.height), color='white')
    result_image.paste(panel_image, (0, 0))  # Paste the panel at the top
    result_image.paste(text_image, (0, panel_image.height))  # Paste the text below the panel

    return result_image

def generate_text_image(text, max_width):
    # Define initial dimensions and color for the text image
    height = 128  # Initial height; this will be adjusted based on text content
    background_color = 'white'
    text_color = 'black'

    # Load a font that supports multilingual characters
    try:
        font = ImageFont.truetype("NotoSansCJKjp-Regular.ttf", 30)  # Use Noto Sans CJK for Chinese, Japanese, Korean
    except IOError:
        print("Font file not found. Using default font.")
        font = ImageFont.load_default()

    # Create a temporary image to calculate text dimensions
    temp_image = Image.new('RGB', (max_width, height), color=background_color)
    draw = ImageDraw.Draw(temp_image)

    # Wrap text to fit within the specified width
    wrapped_text = wrap_text(draw, text, font, max_width)

    # Calculate total height needed for the wrapped text
    text_height = sum([draw.textbbox((0, 0), line, font=font)[3] for line in wrapped_text]) + 20
    text_image = Image.new('RGB', (max_width, text_height), color=background_color)
    draw = ImageDraw.Draw(text_image)

    # Draw each line of text centered horizontally
    y_offset = 10
    for line in wrapped_text:
        text_bbox = draw.textbbox((0, 0), line, font=font)
        line_width = text_bbox[2] - text_bbox[0]
        line_height = text_bbox[3] - text_bbox[1]
        x_offset = (max_width - line_width) // 2  # Center the line horizontally
        draw.text((x_offset, y_offset), line, fill=text_color, font=font)
        y_offset += line_height

    return text_image

def wrap_text(draw, text, font, max_width):
    words = text.split()
    lines = []
    current_line = ""

    for word in words:
        test_line = f"{current_line} {word}".strip()
        width = draw.textbbox((0, 0), test_line, font=font)[2]

        if width <= max_width:
            current_line = test_line
        else:
            lines.append(current_line)
            current_line = word

    lines.append(current_line)  # Add the last line
    return lines

