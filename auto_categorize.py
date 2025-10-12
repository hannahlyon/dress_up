#!/usr/bin/env python3
"""
Auto-categorize remaining clothing items based on visual inspection.
This script processes all remaining items in tops_dresses directory.
"""
import os
import shutil
from pathlib import Path

# Map of filenames to their categories based on visual review
# t = tops, d = dresses, o = outerwear, b = bottoms
categories = {}

# Define paths
tops_dresses_dir = Path("clothes/tops_dresses")
tops_dir = Path("clothes/tops")
dresses_dir = Path("clothes/dresses")
outerwear_dir = Path("clothes/outwear")
bottoms_dir = Path("clothes/bottoms")

# Get all remaining image files
image_files = sorted([f for f in tops_dresses_dir.iterdir() if f.suffix.lower() in ['.png', '.jpg', '.jpeg']])

print(f"Processing {len(image_files)} remaining images...")

# You can add entries here in format: 'filename.png': 't' (or 'd', 'o', 'b')
# This will be populated as Claude categorizes batches

def categorize_and_move():
    moved_count = {"tops": 0, "dresses": 0, "outerwear": 0, "bottoms": 0}

    for img_file in image_files:
        if img_file.name in categories:
            cat = categories[img_file.name]
            if cat == 't':
                dest = tops_dir / img_file.name
                shutil.move(str(img_file), str(dest))
                moved_count["tops"] += 1
            elif cat == 'd':
                dest = dresses_dir / img_file.name
                shutil.move(str(img_file), str(dest))
                moved_count["dresses"] += 1
            elif cat == 'o':
                dest = outerwear_dir / img_file.name
                shutil.move(str(img_file), str(dest))
                moved_count["outerwear"] += 1
            elif cat == 'b':
                dest = bottoms_dir / img_file.name
                shutil.move(str(img_file), str(dest))
                moved_count["bottoms"] += 1

    print(f"\nMoved:")
    print(f"  Tops: {moved_count['tops']}")
    print(f"  Dresses: {moved_count['dresses']}")
    print(f"  Outerwear: {moved_count['outerwear']}")
    print(f"  Bottoms: {moved_count['bottoms']}")
    print(f"  Remaining: {len(list(tops_dresses_dir.glob('*.png')))}")

if __name__ == "__main__":
    if not categories:
        print("No categories defined yet. Add categories to the 'categories' dict first.")
        print("\nRemaining files:")
        for i, img in enumerate(image_files[:20], 1):
            print(f"  {i}. {img.name}")
        if len(image_files) > 20:
            print(f"  ... and {len(image_files) - 20} more")
    else:
        categorize_and_move()
