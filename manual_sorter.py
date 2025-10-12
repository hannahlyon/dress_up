#!/usr/bin/env python3
"""
Interactive clothing image sorter
Press keys to sort images into categories:
t = tops_dresses
b = bottoms
s = shoes
g = bags
a = accessories
q = quit
u = undo last move
"""

import os
import shutil
from pathlib import Path
from PIL import Image
import sys

# Base directory
BASE_DIR = Path("/Users/hannahlyon/Documents/Projects/dress_up/clothes")

# Categories
CATEGORIES = {
    't': 'tops_dresses',
    'b': 'bottoms',
    's': 'shoes',
    'g': 'bags',
    'a': 'accessories'
}

def get_unsorted_images():
    """Get all PNG files that are not in subdirectories"""
    all_files = list(BASE_DIR.glob("*.png"))
    return sorted(all_files)

def show_image(image_path):
    """Display image using default viewer"""
    try:
        img = Image.open(image_path)
        img.show()
        return True
    except Exception as e:
        print(f"Error opening image: {e}")
        return False

def move_image(image_path, category):
    """Move image to category folder"""
    dest_dir = BASE_DIR / CATEGORIES[category]
    dest_dir.mkdir(exist_ok=True)
    dest_path = dest_dir / image_path.name
    shutil.move(str(image_path), str(dest_path))
    return dest_path

def main():
    images = get_unsorted_images()
    total = len(images)

    if total == 0:
        print("✅ All images have been sorted!")
        return

    print(f"\n📦 Found {total} images to sort\n")
    print("Categories:")
    print("  [t] tops_dresses")
    print("  [b] bottoms")
    print("  [s] shoes")
    print("  [g] bags")
    print("  [a] accessories")
    print("  [skip] skip this image")
    print("  [q] quit\n")

    moved_images = []
    current_idx = 0

    while current_idx < len(images):
        image_path = images[current_idx]

        print(f"\n[{current_idx + 1}/{total}] {image_path.name}")

        # Show the image
        if not show_image(image_path):
            print("Could not display image. Skipping...")
            current_idx += 1
            continue

        # Get user input
        choice = input("Sort as (t/b/s/g/a/skip/u/q): ").lower().strip()

        if choice == 'q':
            print(f"\nSorted {len(moved_images)} images. {total - current_idx} remaining.")
            break
        elif choice == 'u':
            if moved_images:
                last_moved = moved_images.pop()
                # Move back to main directory
                shutil.move(str(last_moved['dest']), str(last_moved['src']))
                print(f"✅ Undid: {last_moved['src'].name}")
                # Re-insert into images list
                images.insert(current_idx, last_moved['src'])
                total += 1
            else:
                print("Nothing to undo!")
        elif choice == 'skip':
            print("⏭️  Skipped")
            current_idx += 1
        elif choice in CATEGORIES:
            try:
                dest_path = move_image(image_path, choice)
                moved_images.append({'src': image_path, 'dest': dest_path})
                print(f"✅ Moved to {CATEGORIES[choice]}")
                current_idx += 1
            except Exception as e:
                print(f"❌ Error moving file: {e}")
        else:
            print("Invalid choice. Try again.")

    print(f"\n🎉 Done! Sorted {len(moved_images)} images.")
    print(f"   Remaining: {total - current_idx}")

if __name__ == "__main__":
    main()
