#!/usr/bin/env python3
import os
import shutil
from anthropic import Anthropic
import base64
from pathlib import Path

# Initialize Anthropic client
client = Anthropic(api_key=os.environ.get("ANTHROPIC_API_KEY"))

# Define paths
CLOTHES_DIR = "/Users/hannahlyon/Documents/Projects/dress_up/clothes"
CATEGORIES = {
    "tops_dresses": "tops/dresses",
    "bottoms": "bottoms (pants, shorts, skirts)",
    "shoes": "shoes",
    "bags": "bags",
    "accessories": "accessories (jewelry, hats, scarves, belts, etc.)"
}

def classify_image(image_path):
    """Classify a clothing item image using Claude."""
    with open(image_path, "rb") as img_file:
        image_data = base64.standard_b64encode(img_file.read()).decode("utf-8")

    message = client.messages.create(
        model="claude-3-5-sonnet-20241022",
        max_tokens=100,
        messages=[
            {
                "role": "user",
                "content": [
                    {
                        "type": "image",
                        "source": {
                            "type": "base64",
                            "media_type": "image/png",
                            "data": image_data,
                        },
                    },
                    {
                        "type": "text",
                        "text": "Classify this clothing item into ONE of these categories: tops_dresses, bottoms, shoes, bags, accessories. Respond with ONLY the category name, nothing else."
                    }
                ],
            }
        ],
    )

    category = message.content[0].text.strip().lower()
    return category

def sort_clothes():
    """Sort all clothing items in the clothes directory."""
    # Get all PNG files in the clothes directory (not in subdirectories)
    png_files = [f for f in os.listdir(CLOTHES_DIR)
                 if f.endswith('.png') and os.path.isfile(os.path.join(CLOTHES_DIR, f))]

    print(f"Found {len(png_files)} images to sort...")

    for i, filename in enumerate(png_files, 1):
        src_path = os.path.join(CLOTHES_DIR, filename)

        try:
            # Classify the image
            category = classify_image(src_path)

            # Validate category
            if category not in CATEGORIES:
                print(f"[{i}/{len(png_files)}] {filename}: Unknown category '{category}', skipping...")
                continue

            # Move to appropriate directory
            dest_dir = os.path.join(CLOTHES_DIR, category)
            dest_path = os.path.join(dest_dir, filename)

            shutil.move(src_path, dest_path)
            print(f"[{i}/{len(png_files)}] {filename} → {category}")

        except Exception as e:
            print(f"[{i}/{len(png_files)}] Error processing {filename}: {e}")

    print("\nSorting complete!")

if __name__ == "__main__":
    sort_clothes()
