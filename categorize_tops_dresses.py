#!/usr/bin/env python3
import os
import shutil
from pathlib import Path

# Define paths
tops_dresses_dir = Path("clothes/tops_dresses")
tops_dir = Path("clothes/tops")
dresses_dir = Path("clothes/dresses")
outerwear_dir = Path("clothes/outwear")

# Ensure destination directories exist
tops_dir.mkdir(parents=True, exist_ok=True)
dresses_dir.mkdir(parents=True, exist_ok=True)
outerwear_dir.mkdir(parents=True, exist_ok=True)

# Get all image files
image_files = sorted([f for f in tops_dresses_dir.iterdir() if f.suffix.lower() in ['.png', '.jpg', '.jpeg']])

print(f"Found {len(image_files)} images to categorize")
print("\nCategories:")
print("1 - Tops (t-shirts, blouses, shirts, sweaters, crop tops, tanks, etc.)")
print("2 - Dresses (any full dress)")
print("3 - Outerwear (jackets, coats, blazers, cardigans)")
print("s - Skip this item")
print("q - Quit")

categorized_count = {"tops": 0, "dresses": 0, "outerwear": 0, "skipped": 0}

for idx, image_file in enumerate(image_files):
    print(f"\n[{idx + 1}/{len(image_files)}] Current file: {image_file.name}")
    print(f"Open this file to view: open '{image_file}'")

    choice = input("Categorize as (1=tops, 2=dresses, 3=outerwear, s=skip, q=quit): ").strip().lower()

    if choice == 'q':
        print("Quitting...")
        break
    elif choice == 's':
        print("Skipping...")
        categorized_count["skipped"] += 1
        continue
    elif choice == '1':
        dest = tops_dir / image_file.name
        shutil.move(str(image_file), str(dest))
        print(f"Moved to tops/")
        categorized_count["tops"] += 1
    elif choice == '2':
        dest = dresses_dir / image_file.name
        shutil.move(str(image_file), str(dest))
        print(f"Moved to dresses/")
        categorized_count["dresses"] += 1
    elif choice == '3':
        dest = outerwear_dir / image_file.name
        shutil.move(str(image_file), str(dest))
        print(f"Moved to outerwear/")
        categorized_count["outerwear"] += 1
    else:
        print("Invalid choice, skipping...")
        categorized_count["skipped"] += 1

print("\n" + "="*50)
print("Summary:")
print(f"Tops: {categorized_count['tops']}")
print(f"Dresses: {categorized_count['dresses']}")
print(f"Outerwear: {categorized_count['outerwear']}")
print(f"Skipped: {categorized_count['skipped']}")
print(f"Remaining in tops_dresses/: {len(list(tops_dresses_dir.glob('*.png')))}")
