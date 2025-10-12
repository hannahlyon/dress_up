#!/usr/bin/env python3
"""
Generate a static JSON file containing all clothing items for each category.
This allows the webpage to work as a static site on GitHub Pages.
"""

import os
import json

def generate_items_list():
    """Generate items list for all clothing categories."""
    clothes_dir = 'clothes'
    categories = ['tops', 'outwear', 'dresses', 'bottoms', 'shoes', 'bags', 'accessories']

    items_data = {}

    for category in categories:
        category_path = os.path.join(clothes_dir, category)

        if not os.path.exists(category_path):
            print(f"Warning: Directory {category_path} does not exist")
            items_data[category] = []
            continue

        # Get all image files in the category directory
        items = []
        for filename in os.listdir(category_path):
            # Filter for image files
            if filename.lower().endswith(('.png', '.jpg', '.jpeg', '.gif', '.webp')):
                items.append(filename)

        # Sort items alphabetically
        items.sort()
        items_data[category] = items
        print(f"Found {len(items)} items in {category}")

    # Write to JSON file
    output_file = 'items.json'
    with open(output_file, 'w') as f:
        json.dump(items_data, f, indent=2)

    print(f"\nSuccessfully generated {output_file}")
    print(f"Total categories: {len(items_data)}")
    print(f"Total items: {sum(len(items) for items in items_data.values())}")

if __name__ == '__main__':
    generate_items_list()
