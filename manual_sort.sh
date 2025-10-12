#!/bin/bash
cd /Users/hannahlyon/Documents/Projects/dress_up/clothes

# Get all PNG files in the current directory
FILES=(*.png)

echo "Total files to process: ${#FILES[@]}"

# Process files in batches for easier manual sorting
for file in "${FILES[@]}"; do
    if [ -f "$file" ]; then
        echo "File: $file"
        echo "Waiting for manual classification..."
        # This script is meant to be used interactively
    fi
done
