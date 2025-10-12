#!/usr/bin/env python3
"""
Batch categorize clothing items with image viewing support.
This script will display images and prompt for categorization.
"""
import os
import shutil
import subprocess
from pathlib import Path

# Define paths
tops_dresses_dir = Path("clothes/tops_dresses")
tops_dir = Path("clothes/tops")
dresses_dir = Path("clothes/dresses")
outerwear_dir = Path("clothes/outwear")
bottoms_dir = Path("clothes/bottoms")

# Get all image files
image_files = sorted([f for f in tops_dresses_dir.iterdir() if f.suffix.lower() in ['.png', '.jpg', '.jpeg']])

print(f"Found {len(image_files)} images to categorize")
print("\nInstructions:")
print("For each batch of images, enter categories as a string:")
print("t = tops, d = dresses, o = outerwear, b = bottoms, s = skip")
print("Example: 'ttdotts' for 7 images\n")

batch_size = 10
categorized_count = {"tops": 0, "dresses": 0, "outerwear": 0, "bottoms": 0, "skipped": 0}

for batch_start in range(0, len(image_files), batch_size):
    batch = image_files[batch_start:batch_start + batch_size]

    print(f"\n{'='*60}")
    print(f"Batch {batch_start//batch_size + 1}: Items {batch_start + 1} to {batch_start + len(batch)}")
    print(f"{'='*60}")

    # Show files in batch
    for idx, img in enumerate(batch, 1):
        print(f"{idx}. {img.name}")

    print(f"\nTo view images, run:")
    print(f"open " + " ".join([f'"{img}"' for img in batch]))

    # Get categorization input
    while True:
        categories_input = input(f"\nEnter {len(batch)} categories (t/d/o/b/s) or 'q' to quit: ").strip().lower()

        if categories_input == 'q':
            print("Quitting...")
            break

        if len(categories_input) != len(batch):
            print(f"Error: Need exactly {len(batch)} categories, got {len(categories_input)}")
            continue

        # Process the batch
        for img, cat in zip(batch, categories_input):
            if cat == 't':
                dest = tops_dir / img.name
                shutil.move(str(img), str(dest))
                categorized_count["tops"] += 1
            elif cat == 'd':
                dest = dresses_dir / img.name
                shutil.move(str(img), str(dest))
                categorized_count["dresses"] += 1
            elif cat == 'o':
                dest = outerwear_dir / img.name
                shutil.move(str(img), str(dest))
                categorized_count["outerwear"] += 1
            elif cat == 'b':
                dest = bottoms_dir / img.name
                shutil.move(str(img), str(dest))
                categorized_count["bottoms"] += 1
            elif cat == 's':
                categorized_count["skipped"] += 1
            else:
                print(f"Warning: Invalid category '{cat}' for {img.name}, skipping")
                categorized_count["skipped"] += 1

        print(f"Batch processed!")
        break

    if categories_input == 'q':
        break

print("\n" + "="*60)
print("Summary:")
print(f"Tops: {categorized_count['tops']}")
print(f"Dresses: {categorized_count['dresses']}")
print(f"Outerwear: {categorized_count['outerwear']}")
print(f"Bottoms: {categorized_count['bottoms']}")
print(f"Skipped: {categorized_count['skipped']}")
print(f"Remaining in tops_dresses/: {len(list(tops_dresses_dir.glob('*.png')))}")
