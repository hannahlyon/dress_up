// State management
const state = {
    categories: [],
    selectedItems: {},
    maxCategories: 5,
    itemsData: null
};

// Available category options
const availableCategories = ['tops', 'outwear', 'dresses', 'bottoms', 'shoes', 'bags', 'accessories'];

// DOM elements
const addCategoryBtn = document.getElementById('add-category-btn');
const categoryModal = document.getElementById('category-modal');
const categoriesContainer = document.getElementById('categories-container');
const outfitPreview = document.getElementById('outfit-preview');
const categoryCount = document.querySelector('.category-count');
const clearOutfitBtn = document.getElementById('clear-outfit-btn');

// Initialize the app
async function init() {
    // Load items data
    await loadItemsData();

    addCategoryBtn.addEventListener('click', openCategoryModal);
    clearOutfitBtn.addEventListener('click', clearOutfit);

    // Modal event listeners
    const closeModalBtn = document.querySelector('.close-modal');
    closeModalBtn.addEventListener('click', closeCategoryModal);

    categoryModal.addEventListener('click', (e) => {
        if (e.target === categoryModal) {
            closeCategoryModal();
        }
    });

    // Category option buttons
    const categoryOptions = document.querySelectorAll('.category-option');
    categoryOptions.forEach(btn => {
        btn.addEventListener('click', () => {
            const category = btn.dataset.category;
            addCategory(category);
            closeCategoryModal();
        });
    });

    updateUI();
}

// Load items data from JSON file
async function loadItemsData() {
    try {
        const response = await fetch('items.json');
        if (!response.ok) {
            throw new Error('Failed to load items data');
        }
        state.itemsData = await response.json();
    } catch (error) {
        console.error('Error loading items data:', error);
        state.itemsData = {};
    }
}

// Open category selection modal
function openCategoryModal() {
    categoryModal.classList.add('active');
    updateCategoryOptions();
}

// Close category selection modal
function closeCategoryModal() {
    categoryModal.classList.remove('active');
}

// Update available category options in modal
function updateCategoryOptions() {
    const categoryOptions = document.querySelectorAll('.category-option');
    categoryOptions.forEach(btn => {
        const category = btn.dataset.category;
        if (state.categories.includes(category)) {
            btn.disabled = true;
        } else {
            btn.disabled = false;
        }
    });
}

// Add a category
async function addCategory(category) {
    if (state.categories.length >= state.maxCategories) {
        alert('Maximum 5 categories allowed');
        return;
    }

    if (state.categories.includes(category)) {
        alert('Category already added');
        return;
    }

    state.categories.push(category);
    await renderCategory(category);
    updateUI();
}

// Remove a category
function removeCategory(category) {
    state.categories = state.categories.filter(cat => cat !== category);
    delete state.selectedItems[category];
    renderCategories();
    updateOutfitPreview();
    updateUI();
}

// Render all categories
async function renderCategories() {
    categoriesContainer.innerHTML = '';
    for (const category of state.categories) {
        await renderCategory(category);
    }
}

// Render a single category
async function renderCategory(category) {
    const categorySection = document.createElement('div');
    categorySection.className = 'category-section';
    categorySection.dataset.category = category;

    const categoryHeader = document.createElement('div');
    categoryHeader.className = 'category-header';

    const categoryTitle = document.createElement('h3');
    categoryTitle.className = 'category-title';
    categoryTitle.textContent = category;

    const removeBtn = document.createElement('button');
    removeBtn.className = 'remove-category-btn';
    removeBtn.textContent = 'Remove';
    removeBtn.addEventListener('click', () => removeCategory(category));

    categoryHeader.appendChild(categoryTitle);
    categoryHeader.appendChild(removeBtn);
    categorySection.appendChild(categoryHeader);

    const scrollContainer = document.createElement('div');
    scrollContainer.className = 'items-scroll-container';

    // Load items from the category directory
    try {
        const items = await loadCategoryItems(category);

        if (items.length === 0) {
            const emptyMsg = document.createElement('div');
            emptyMsg.className = 'empty-category';
            emptyMsg.textContent = 'No items found in this category';
            scrollContainer.appendChild(emptyMsg);
        } else {
            items.forEach(item => {
                const itemCard = createItemCard(category, item);
                scrollContainer.appendChild(itemCard);
            });
        }
    } catch (error) {
        console.error(`Error loading items for ${category}:`, error);
        const errorMsg = document.createElement('div');
        errorMsg.className = 'empty-category';
        errorMsg.textContent = 'Error loading items';
        scrollContainer.appendChild(errorMsg);
    }

    categorySection.appendChild(scrollContainer);
    categoriesContainer.appendChild(categorySection);
}

// Load items from a category directory
async function loadCategoryItems(category) {
    if (!state.itemsData) {
        console.error('Items data not loaded');
        return [];
    }

    return state.itemsData[category] || [];
}

// Create an item card
function createItemCard(category, itemFilename) {
    const itemCard = document.createElement('div');
    itemCard.className = 'item-card';
    if (state.selectedItems[category] === itemFilename) {
        itemCard.classList.add('selected');
    }

    const itemImage = document.createElement('img');
    itemImage.className = 'item-image';
    itemImage.src = `clothes/${category}/${itemFilename}`;
    itemImage.alt = itemFilename;
    itemImage.loading = 'lazy';

    itemCard.appendChild(itemImage);

    itemCard.addEventListener('click', () => {
        selectItem(category, itemFilename);
    });

    return itemCard;
}

// Select an item
function selectItem(category, itemFilename) {
    // Toggle selection
    if (state.selectedItems[category] === itemFilename) {
        delete state.selectedItems[category];
    } else {
        state.selectedItems[category] = itemFilename;
    }

    // Update the category section to show selection
    const categorySection = document.querySelector(`[data-category="${category}"]`);
    if (categorySection) {
        const itemCards = categorySection.querySelectorAll('.item-card');
        itemCards.forEach(card => {
            const img = card.querySelector('.item-image');
            if (img.src.endsWith(itemFilename)) {
                card.classList.toggle('selected');
            } else {
                card.classList.remove('selected');
            }
        });
    }

    updateOutfitPreview();
}

// Update outfit preview
function updateOutfitPreview() {
    outfitPreview.innerHTML = '';

    const selectedCount = Object.keys(state.selectedItems).length;

    if (selectedCount === 0) {
        const emptyState = document.createElement('p');
        emptyState.className = 'empty-state';
        emptyState.textContent = 'Select items from categories to build your outfit';
        outfitPreview.appendChild(emptyState);
    } else {
        Object.entries(state.selectedItems).forEach(([category, itemFilename]) => {
            const outfitItem = document.createElement('div');
            outfitItem.className = 'outfit-item';

            const label = document.createElement('div');
            label.className = 'outfit-item-label';
            label.textContent = category;

            const img = document.createElement('img');
            img.className = 'outfit-item-image';
            img.src = `clothes/${category}/${itemFilename}`;
            img.alt = `${category} - ${itemFilename}`;

            outfitItem.appendChild(label);
            outfitItem.appendChild(img);
            outfitPreview.appendChild(outfitItem);
        });
    }
}

// Clear outfit
function clearOutfit() {
    state.selectedItems = {};

    // Remove selected class from all items
    const allItemCards = document.querySelectorAll('.item-card');
    allItemCards.forEach(card => {
        card.classList.remove('selected');
    });

    updateOutfitPreview();
}

// Update UI based on state
function updateUI() {
    // Update category count
    categoryCount.textContent = `${state.categories.length} / ${state.maxCategories} categories added`;

    // Disable add button if max categories reached
    if (state.categories.length >= state.maxCategories) {
        addCategoryBtn.disabled = true;
    } else {
        addCategoryBtn.disabled = false;
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', init);
