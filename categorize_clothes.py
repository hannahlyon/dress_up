#!/usr/bin/env python3
"""
Script to categorize clothing images into tops, dresses, and outerwear
"""
import os
import shutil
from pathlib import Path

# Define paths
base_dir = Path("/Users/hannahlyon/Documents/Projects/dress_up/clothes")
source_dir = base_dir / "tops_dresses"
tops_dir = base_dir / "tops"
dresses_dir = base_dir / "dresses"
outwear_dir = base_dir / "outwear"

# Manual categorization based on visual inspection
# Format: filename: category (tops, dresses, outwear)

categorization = {
    # First batch examined
    "0089f574-a5a1-4a60-bbaf-e26b773e64df.png": "dresses",  # t-shirt dress
    "0435cbc5-693f-45c8-958a-20c5d27afa97.png": "outwear",  # blazer
    "049c1a2a-0410-4b22-98ee-7972121042ba.png": "tops",  # crop sweater
    "090eb0a5-e602-4645-93da-36dd5b2a467a.png": "tops",  # off-shoulder top
    "0acb3ca3-3c1f-4fdb-aec2-d014db68eefd.png": "tops",  # mock neck shirt
    "0b0e1938-9817-4cb5-a137-f73018c520f4.png": "tops",  # asymmetric tank
    "0b2af6e7-2503-46a1-ac3c-c38e5482184f.png": "outwear",  # cardigan
    "0cf5b017-df7b-4fbc-907e-a994571b4801.png": "tops",  # off-shoulder metallic top
    "0dd2fec1-6a3b-4cec-b623-6f2260f62f1e.png": "tops",  # long sleeve tee
    "1014a7da-3487-4a47-88f6-23ae9ec288b6.png": "tops",  # blouse with ruffles

    # Second batch
    "1121fc75-871e-4ece-8e9a-1d23487dbd3a.png": "tops",  # long sleeve top
    "1343d028-2f67-483a-8724-97d48be00db4.png": "tops",  # striped blouse
    "1394789c-2520-4a9c-a5a1-5dab8d876664.png": "dresses",  # fit and flare dress
    "17041efe-5a3a-45d0-a7f3-4e9e026d54fd.png": "tops",  # fitted corset top
    "17bed036-bda5-47ae-ba3c-d412863d0548.png": "outwear",  # athletic jacket
    "17f46a9f-7aeb-4cbf-b7e0-a378188a12f1.png": "dresses",  # tiered ruffle dress
    "1b3239ef-85c9-4f18-9445-2502cdaecfe7.png": "tops",  # lace cami/babydoll top
    "1b9ad528-9d56-46a2-8c34-7081c53eb62e.png": "tops",  # butterfly/wrap halter top
    "1cae6fdb-6703-4aa5-bf06-12b558425624.png": "tops",  # bodysuit
    "1dd10564-060d-4d9b-852b-894b917be951.png": "tops",  # wrap crop top
    "1ec36d09-b5fa-4151-9109-1cd8a9ef0982.png": "tops",  # crop turtleneck sweater
    "1ed9e3e6-1d65-4c25-900f-8c48cf2b1376.png": "outwear",  # cropped cardigan
    "20f4d942-f3fe-4494-ab17-f7c106f1f0f2.png": "tops",  # crop balloon sleeve top
    "210b825d-4dd2-4799-9a87-12ffe48c67c8.png": "dresses",  # two piece set (counts as dress)
    "2255035f-29f5-400f-8e1a-db8d78e0d5b1.png": "dresses",  # mini dress

    # Third batch
    "23c7eabf-afe8-4959-9558-db9e700c1ba7.png": "tops",  # floral crop top
    "23fbf33f-4b9e-4760-a4dc-0641c6c26b78.png": "bottoms",  # This is clearly bottoms - cargo skirt
    "24c41010-3a30-4b4d-9566-8348e608dca7.png": "dresses",  # sweater dress
    "2502d322-9dc1-4859-9188-a81c3499275f.png": "dresses",  # paisley slip dress
    "259252ea-80f0-4074-a60c-4dac2a6c2abb.png": "dresses",  # ribbed sweater dress
    "2762802e-5853-46e9-bb7b-0f7deb62ec3e.png": "dresses",  # black slip dress
    "280e4182-cfbe-44c5-8299-ca549dda39f7.png": "dresses",  # long slip dress
    "28355dba-a761-41f3-b689-2ffa269b1400.png": "tops",  # crop sweater
    "285aa3d1-a500-4b00-a666-f7c0fcc64195.png": "outwear",  # knit cardigan
    "29b4a50c-2f28-4901-ba76-4bc16f9815b1.png": "outwear",  # leather vest
    "29e78fb4-62ec-4736-a0f5-45ad7afc3ff1.png": "tops",  # halter top
    "2a7b4ef3-c55b-4dc2-a337-2edcf7359698.png": "tops",  # graphic tee
    "2d8c39a6-e78a-45f7-a99a-b1a26380fd6f.png": "dresses",  # crochet dress
    "2df60389-45b8-4d9c-9925-2400daef8765.png": "dresses",  # fit and flare dress
    "2e6baf55-3140-41b7-ade4-4138ac2da993.png": "tops",  # cami top
}

def move_files():
    """Move files to their categorized directories"""
    moved_counts = {"tops": 0, "dresses": 0, "outwear": 0, "bottoms": 0}
    errors = []

    for filename, category in categorization.items():
        source_path = source_dir / filename

        if not source_path.exists():
            errors.append(f"File not found: {filename}")
            continue

        # Determine destination
        if category == "tops":
            dest_dir = tops_dir
        elif category == "dresses":
            dest_dir = dresses_dir
        elif category == "outwear":
            dest_dir = outwear_dir
        elif category == "bottoms":
            dest_dir = base_dir / "bottoms"
        else:
            errors.append(f"Unknown category for {filename}: {category}")
            continue

        dest_path = dest_dir / filename

        try:
            shutil.move(str(source_path), str(dest_path))
            moved_counts[category] += 1
            print(f"Moved {filename} to {category}/")
        except Exception as e:
            errors.append(f"Error moving {filename}: {str(e)}")

    return moved_counts, errors

if __name__ == "__main__":
    print(f"Starting categorization...")
    print(f"Source directory: {source_dir}")
    print(f"Items to categorize: {len(categorization)}")
    print()

    counts, errors = move_files()

    print("\n" + "="*50)
    print("SUMMARY")
    print("="*50)
    print(f"Tops moved: {counts['tops']}")
    print(f"Dresses moved: {counts['dresses']}")
    print(f"Outerwear moved: {counts['outwear']}")
    print(f"Bottoms moved (misplaced): {counts['bottoms']}")
    print(f"Total moved: {sum(counts.values())}")

    if errors:
        print(f"\nErrors: {len(errors)}")
        for error in errors:
            print(f"  - {error}")

    # Check remaining files
    remaining = list(source_dir.glob("*.png"))
    print(f"\nRemaining in tops_dresses/: {len(remaining)}")
