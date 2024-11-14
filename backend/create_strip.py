from PIL import Image
import os

def resize_and_add_border(image, target_size, border_size):
    """
    Resize the image to fit within the target size and center it on a bordered canvas.
    """
    # Resize the image to fit within the target size
    image.thumbnail((target_size[0] - 2 * border_size, target_size[1] - 2 * border_size), Image.Resampling.LANCZOS)
    
    # Create a new canvas with the specified border size
    canvas = Image.new("RGB", target_size, "black")
    x_offset = (target_size[0] - image.width) // 2
    y_offset = (target_size[1] - image.height) // 2
    canvas.paste(image, (x_offset, y_offset))
    return canvas

def create_strip(images, layout=2, border_size=10, output_pdf_path="output.pdf"):
    """
    Creates a multi-page PDF of images based on the specified layout type.
    - layout=1: One image per page
    - layout=2: Two images per page
    Returns the path to the generated PDF.
    """
    target_width = 600  # Target width for each image
    target_height = 800  # Target height for each image

    # Determine canvas dimensions based on layout
    if layout == 1:
        canvas_width = target_width
        canvas_height = target_height
    elif layout == 2:
        canvas_width = target_width
        canvas_height = target_height * 2 + border_size

    # Create a list to store resulting pages
    result_images = []
    
    for i in range(0, len(images), layout):
        # Create a blank canvas for the current page
        canvas = Image.new("RGB", (canvas_width, canvas_height), "white")
        
        if layout == 1:
            # Place one image per page
            img = resize_and_add_border(images[i], (target_width, target_height), border_size)
            canvas.paste(img, (0, 0))
        
        elif layout == 2:
            # Place two images per page if possible
            img1 = resize_and_add_border(images[i], (target_width, target_height), border_size)
            canvas.paste(img1, (0, 0))

            if i + 1 < len(images):
                img2 = resize_and_add_border(images[i + 1], (target_width, target_height), border_size)
                canvas.paste(img2, (0, target_height + border_size))
        
        # Append the canvas to result images
        result_images.append(canvas)

    # Save the result images as a multi-page PDF
    if result_images:
        result_images[0].save(
            output_pdf_path,
            save_all=True,
            append_images=result_images[1:],
            format="PDF"
        )

    return output_pdf_path
