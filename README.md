# Outfit Creator for Streamers

An interactive outfit creation tool that allows viewers to pick outfits from a streamer's closet. Perfect for interactive stream activities!

## Features

- Clean, modern black and white UI
- Add up to 5 clothing categories at a time
- Horizontally scrollable item galleries
- Click to select/deselect items
- Preview your complete outfit
- Fully static website - deploy to GitHub Pages for free
- Mobile-friendly and responsive design

## Live Demo

Check out the live version: [Your GitHub Pages URL]

## Quick Start

1. Clone this repository
2. Add your clothing images to the appropriate folders
3. Run the Python script to generate the items list
4. Open `index.html` in a browser or deploy to GitHub Pages

## Customizing with Your Own Closet

### Step 1: Prepare Your Clothing Images

1. Take photos of your clothing items
   - Use a consistent background (solid colors work best)
   - Take photos from the same angle/distance for consistency
   - PNG files work best for transparency, but JPG is fine too
   - Recommended resolution: 500-1000px on the longest side

2. Save your images with descriptive filenames (optional but helpful)
   - Examples: `black-tshirt.png`, `denim-jacket.jpg`, `red-dress.png`

### Step 2: Organize Your Clothing

Place your clothing images into the appropriate category folders in the `clothes/` directory:

```
clothes/
├── tops/          # T-shirts, blouses, shirts, tank tops
├── outwear/       # Jackets, coats, cardigans, hoodies
├── dresses/       # Dresses, jumpsuits, rompers
├── bottoms/       # Pants, skirts, shorts, leggings
├── shoes/         # All footwear
├── bags/          # Purses, backpacks, totes
└── accessories/   # Jewelry, hats, scarves, belts
```

**Important:** Make sure your image files have these extensions: `.png`, `.jpg`, `.jpeg`, `.gif`, or `.webp`

### Step 3: Generate the Items List

The website needs a JSON file that lists all your clothing items. To generate it:

1. Make sure Python 3 is installed on your computer
2. Open a terminal/command prompt in the project directory
3. Run the generation script:

```bash
python3 generate_items_list.py
```

You should see output like:
```
Found 115 items in tops
Found 29 items in outwear
...
Successfully generated items.json
```

**Note:** Run this script every time you add, remove, or move clothing items!

### Step 4: Personalize the Website

#### Change the Title

Edit `index.html` and update line 12:

```html
<h1>Hannahbunnn's Outfit Creator</h1>
```

Change it to your streamer name:

```html
<h1>YourName's Outfit Creator</h1>
```

#### Change the Page Title (Browser Tab)

Edit line 6 in `index.html`:

```html
<title>Outfit Creator</title>
```

#### Customize Colors (Optional)

The default design is black and white. To customize colors, edit `style.css`:

- Background color: Search for `background-color: #ffffff` (white)
- Text color: Search for `color: #000000` (black)
- Accent color: Search for `background-color: #000000` (buttons, borders)

### Step 5: Test Locally

Before deploying, test your website locally:

1. Open a terminal in the project directory
2. Start a local server:

```bash
python3 -m http.server 8000
```

3. Open your browser and go to: `http://localhost:8000`
4. Test all features:
   - Click the "+" button to add categories
   - Scroll through items in each category
   - Click items to select them
   - Check the outfit preview at the bottom
   - Test the "Remove" and "Clear Outfit" buttons

### Step 6: Deploy to GitHub Pages

Make your outfit creator available online for free:

1. Create a GitHub account if you don't have one
2. Create a new repository (e.g., "outfit-creator")
3. Upload all project files to the repository:
   - `index.html`
   - `style.css`
   - `script.js`
   - `items.json`
   - `clothes/` folder with all your images
   - `README.md` (optional)

4. Enable GitHub Pages:
   - Go to repository Settings
   - Scroll to "Pages" section
   - Under "Source", select "main" branch
   - Click "Save"

5. Your site will be live at: `https://yourusername.github.io/outfit-creator/`

## Using During a Stream

### OBS Studio Setup

1. Add a Browser Source to your scene
2. Enter your GitHub Pages URL
3. Set the width and height (1920x1080 recommended)
4. Check "Refresh browser when scene becomes active"
5. Interact with the page using OBS's "Interact" button or Window Capture

### Interaction Ideas

- **Redeem with Channel Points:** Let viewers redeem to add a clothing category
- **Chat Commands:** Use chat commands to trigger category additions
- **Polls:** Let chat vote on which category to add next
- **Subscriber Events:** Add random categories when someone subscribes
- **Random Outfit Generator:** Close your eyes and let chat pick!

## File Structure

```
outfit-creator/
├── index.html              # Main HTML file
├── style.css              # All styling
├── script.js              # Interactive functionality
├── items.json             # Generated list of all items
├── generate_items_list.py # Script to generate items.json
├── README.md              # This file
└── clothes/               # Your clothing images
    ├── tops/
    ├── outwear/
    ├── dresses/
    ├── bottoms/
    ├── shoes/
    ├── bags/
    └── accessories/
```

## Troubleshooting

### Images aren't showing up
- Make sure you ran `generate_items_list.py` after adding images
- Check that your images are in the correct folders
- Verify image file extensions are supported (.png, .jpg, .jpeg, .gif, .webp)
- Clear your browser cache and refresh

### Categories show "No items found"
- Run `generate_items_list.py` again
- Check that the folder name matches exactly (lowercase, correct spelling)
- Make sure there are actually image files in that folder

### Items are cut off or distorted
- The CSS is set to `object-fit: contain` which shows the full image
- Images are scaled to fit within 150px height while maintaining aspect ratio
- White space is added to fill the container

### Website doesn't work on GitHub Pages
- Make sure all files are uploaded, especially `items.json`
- Check that the `clothes/` folder and all images are uploaded
- Wait a few minutes after enabling GitHub Pages (can take 5-10 minutes)
- Check the browser console for errors (F12 → Console tab)

### Need to add/remove items
1. Add or remove image files from the `clothes/` folders
2. Run `python3 generate_items_list.py`
3. If on GitHub Pages, commit and push the updated `items.json`
4. Refresh your browser

## Advanced Customization

### Adding More Categories

1. Create a new folder in `clothes/` (e.g., `clothes/jewelry/`)
2. Add the category to `script.js` line 9:
```javascript
const availableCategories = ['tops', 'outwear', 'dresses', 'bottoms', 'shoes', 'bags', 'accessories', 'jewelry'];
```
3. Add a button in `index.html` inside the modal:
```html
<button class="category-option" data-category="jewelry">Jewelry</button>
```
4. Update `generate_items_list.py` line 11:
```python
categories = ['tops', 'outwear', 'dresses', 'bottoms', 'shoes', 'bags', 'accessories', 'jewelry']
```
5. Run `python3 generate_items_list.py`

### Changing the Maximum Categories

Edit `script.js` line 5:
```javascript
maxCategories: 5  // Change to any number
```

### Adding a Screenshot/Export Feature

You can add a button to screenshot the outfit using html2canvas library. Add to `index.html` before `</body>`:
```html
<script src="https://cdn.jsdelivr.net/npm/html2canvas@1.4.1/dist/html2canvas.min.js"></script>
```

## Credits

Created for interactive streaming content. Feel free to customize and share!

## Support

If you run into issues or have questions:
1. Check the Troubleshooting section above
2. Make sure you followed all steps in order
3. Check your browser console for error messages (F12 → Console)

## License

Feel free to use, modify, and distribute this project for your streaming needs!
