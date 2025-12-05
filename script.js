// State management
const state = {
  categories: [],
  selectedItems: {},
  maxCategories: 5,
  itemsData: null,
};

// OBS localStorage key
const OBS_STORAGE_KEY = 'obsOutfit';

// Available category options
const availableCategories = [
  "tops",
  "outwear",
  "dresses",
  "bottoms",
  "shoes",
  "bags",
  "accessories",
  "molly",
];

// DOM elements
const addCategoryBtn = document.getElementById("add-category-btn");
const randomizeBtn = document.getElementById("randomize-btn");
const categoryModal = document.getElementById("category-modal");
const categoriesContainer = document.getElementById("categories-container");
const outfitPreview = document.getElementById("outfit-preview");
const categoryCount = document.querySelector(".category-count");
const clearOutfitBtn = document.getElementById("clear-outfit-btn");
const shareOutfitBtn = document.getElementById("share-outfit-btn");
const shareModal = document.getElementById("share-modal");

// Initialize the app
async function init() {
  // Initialize dark mode
  initDarkMode();

  // Load items data
  await loadItemsData();

  addCategoryBtn.addEventListener("click", openCategoryModal);
  randomizeBtn.addEventListener("click", randomizeOutfit);
  clearOutfitBtn.addEventListener("click", clearOutfit);
  shareOutfitBtn.addEventListener("click", openShareModal);

  // Modal event listeners
  const closeModalBtn = document.querySelector(".close-modal");
  closeModalBtn.addEventListener("click", closeCategoryModal);

  const closeShareModalBtn = document.getElementById("close-share-modal");
  closeShareModalBtn.addEventListener("click", closeShareModal);

  categoryModal.addEventListener("click", (e) => {
    if (e.target === categoryModal) {
      closeCategoryModal();
    }
  });

  shareModal.addEventListener("click", (e) => {
    if (e.target === shareModal) {
      closeShareModal();
    }
  });

  // Share option event listeners
  document
    .getElementById("share-email")
    .addEventListener("click", shareViaEmail);
  document
    .getElementById("share-messages")
    .addEventListener("click", shareViaMessages);
  document
    .getElementById("download-image")
    .addEventListener("click", downloadOutfitImage);

  // Category option buttons
  const categoryOptions = document.querySelectorAll(".category-option");
  categoryOptions.forEach((btn) => {
    btn.addEventListener("click", () => {
      const category = btn.dataset.category;
      addCategory(category);
      closeCategoryModal();
    });
  });

  // OBS button event listeners
  const sendToObsBtn = document.getElementById("send-to-obs-btn");
  if (sendToObsBtn) {
    sendToObsBtn.addEventListener("click", sendToOBS);
  }

  const clearObsBtn = document.getElementById("clear-obs-btn");
  if (clearObsBtn) {
    clearObsBtn.addEventListener("click", clearOBS);
  }

  const copyObsUrlBtn = document.getElementById("copy-obs-url-btn");
  if (copyObsUrlBtn) {
    copyObsUrlBtn.addEventListener("click", copyOBSUrl);
  }

  updateUI();
}

// Load items data from JSON file
async function loadItemsData() {
  try {
    const response = await fetch("items.json");
    if (!response.ok) {
      throw new Error("Failed to load items data");
    }
    state.itemsData = await response.json();
  } catch (error) {
    console.error("Error loading items data:", error);
    state.itemsData = {};
  }
}

// Open category selection modal
function openCategoryModal() {
  categoryModal.classList.add("active");
  updateCategoryOptions();
}

// Close category selection modal
function closeCategoryModal() {
  categoryModal.classList.remove("active");
}

// Update available category options in modal
function updateCategoryOptions() {
  const categoryOptions = document.querySelectorAll(".category-option");
  categoryOptions.forEach((btn) => {
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
    alert("Maximum 5 categories allowed");
    return;
  }

  if (state.categories.includes(category)) {
    alert("Category already added");
    return;
  }

  state.categories.push(category);
  await renderCategory(category);
  updateUI();
}

// Remove a category
function removeCategory(category) {
  state.categories = state.categories.filter((cat) => cat !== category);
  delete state.selectedItems[category];
  renderCategories();
  updateOutfitPreview();
  updateUI();
}

// Render all categories
async function renderCategories() {
  categoriesContainer.innerHTML = "";
  for (const category of state.categories) {
    await renderCategory(category);
  }
}

// Render a single category
async function renderCategory(category) {
  const categorySection = document.createElement("div");
  categorySection.className = "category-section";
  categorySection.dataset.category = category;

  const categoryHeader = document.createElement("div");
  categoryHeader.className = "category-header";

  const categoryTitle = document.createElement("h3");
  categoryTitle.className = "category-title";
  categoryTitle.textContent = category;

  const removeBtn = document.createElement("button");
  removeBtn.className = "remove-category-btn";
  removeBtn.textContent = "Remove";
  removeBtn.addEventListener("click", () => removeCategory(category));

  categoryHeader.appendChild(categoryTitle);
  categoryHeader.appendChild(removeBtn);
  categorySection.appendChild(categoryHeader);

  const scrollContainer = document.createElement("div");
  scrollContainer.className = "items-scroll-container";

  // Load items from the category directory
  try {
    const items = await loadCategoryItems(category);

    if (items.length === 0) {
      const emptyMsg = document.createElement("div");
      emptyMsg.className = "empty-category";
      emptyMsg.textContent = "No items found in this category";
      scrollContainer.appendChild(emptyMsg);
    } else {
      items.forEach((item) => {
        const itemCard = createItemCard(category, item);
        scrollContainer.appendChild(itemCard);
      });
    }
  } catch (error) {
    console.error(`Error loading items for ${category}:`, error);
    const errorMsg = document.createElement("div");
    errorMsg.className = "empty-category";
    errorMsg.textContent = "Error loading items";
    scrollContainer.appendChild(errorMsg);
  }

  categorySection.appendChild(scrollContainer);
  categoriesContainer.appendChild(categorySection);
}

// Load items from a category directory
async function loadCategoryItems(category) {
  if (!state.itemsData) {
    console.error("Items data not loaded");
    return [];
  }

  return state.itemsData[category] || [];
}

// Create an item card
function createItemCard(category, itemFilename) {
  const itemCard = document.createElement("div");
  itemCard.className = "item-card";

  // Check if item is selected (handle both string and array for accessories and molly)
  if ((category === "accessories" || category === "molly") && Array.isArray(state.selectedItems[category])) {
    if (state.selectedItems[category].includes(itemFilename)) {
      itemCard.classList.add("selected");
    }
  } else if (state.selectedItems[category] === itemFilename) {
    itemCard.classList.add("selected");
  }

  const itemImage = document.createElement("img");
  itemImage.className = "item-image";
  itemImage.src = `clothes/${category}/${itemFilename}`;
  itemImage.alt = itemFilename;
  itemImage.loading = "lazy";

  itemCard.appendChild(itemImage);

  itemCard.addEventListener("click", () => {
    selectItem(category, itemFilename);
  });

  return itemCard;
}

// Select an item
function selectItem(category, itemFilename) {
  // Handle accessories and molly differently - allow multiple selections
  if (category === "accessories" || category === "molly") {
    // Initialize as array if it doesn't exist
    if (!state.selectedItems[category]) {
      state.selectedItems[category] = [];
    }

    // Toggle selection
    const index = state.selectedItems[category].indexOf(itemFilename);
    if (index > -1) {
      // Item is already selected, remove it
      state.selectedItems[category].splice(index, 1);

      // If no items left, delete the category
      if (state.selectedItems[category].length === 0) {
        delete state.selectedItems[category];
      }
    } else {
      // Add item to selection
      state.selectedItems[category].push(itemFilename);
    }

    // Update the category section to show selection
    const categorySection = document.querySelector(
      `[data-category="${category}"]`
    );
    if (categorySection) {
      const itemCards = categorySection.querySelectorAll(".item-card");
      itemCards.forEach((card) => {
        const img = card.querySelector(".item-image");
        if (img.src.endsWith(itemFilename)) {
          card.classList.toggle("selected");
        }
      });
    }
  } else {
    // For other categories, single selection behavior
    if (state.selectedItems[category] === itemFilename) {
      delete state.selectedItems[category];
    } else {
      state.selectedItems[category] = itemFilename;
    }

    // Update the category section to show selection
    const categorySection = document.querySelector(
      `[data-category="${category}"]`
    );
    if (categorySection) {
      const itemCards = categorySection.querySelectorAll(".item-card");
      itemCards.forEach((card) => {
        const img = card.querySelector(".item-image");
        if (img.src.endsWith(itemFilename)) {
          card.classList.toggle("selected");
        } else {
          card.classList.remove("selected");
        }
      });
    }
  }

  updateOutfitPreview();
}

// Update outfit preview
function updateOutfitPreview() {
  outfitPreview.innerHTML = "";

  const selectedCount = Object.keys(state.selectedItems).length;

  if (selectedCount === 0) {
    const emptyState = document.createElement("p");
    emptyState.className = "empty-state";
    emptyState.textContent =
      "Select items from categories to build your outfit";
    outfitPreview.appendChild(emptyState);
  } else {
    Object.entries(state.selectedItems).forEach(([category, itemData]) => {
      // Handle accessories and molly as array, other categories as single item
      if ((category === "accessories" || category === "molly") && Array.isArray(itemData)) {
        // Display each item separately
        itemData.forEach((itemFilename) => {
          const outfitItem = document.createElement("div");
          outfitItem.className = "outfit-item";

          const label = document.createElement("div");
          label.className = "outfit-item-label";
          label.textContent = category;

          const img = document.createElement("img");
          img.className = "outfit-item-image";
          img.src = `clothes/${category}/${itemFilename}`;
          img.alt = `${category} - ${itemFilename}`;

          outfitItem.appendChild(label);
          outfitItem.appendChild(img);
          outfitPreview.appendChild(outfitItem);
        });
      } else {
        // Single item display for other categories
        const outfitItem = document.createElement("div");
        outfitItem.className = "outfit-item";

        const label = document.createElement("div");
        label.className = "outfit-item-label";
        label.textContent = category;

        const img = document.createElement("img");
        img.className = "outfit-item-image";
        img.src = `clothes/${category}/${itemData}`;
        img.alt = `${category} - ${itemData}`;

        outfitItem.appendChild(label);
        outfitItem.appendChild(img);
        outfitPreview.appendChild(outfitItem);
      }
    });
  }
}

// Clear outfit
function clearOutfit() {
  state.selectedItems = {};

  // Remove selected class from all items
  const allItemCards = document.querySelectorAll(".item-card");
  allItemCards.forEach((card) => {
    card.classList.remove("selected");
  });

  updateOutfitPreview();
}

// Randomize outfit - picks 3 random categories and 1 random item from each
async function randomizeOutfit() {
  // Clear current outfit and categories
  clearOutfit();
  state.categories = [];
  categoriesContainer.innerHTML = "";

  // Pick 3 random categories
  const shuffledCategories = [...availableCategories].sort(
    () => Math.random() - 0.5
  );
  const selectedCategories = shuffledCategories.slice(0, 3);

  // Add the categories and select random items
  for (const category of selectedCategories) {
    await addCategory(category);

    // Get items for this category
    const items = await loadCategoryItems(category);

    if (items.length > 0) {
      // For accessories and molly, select 1-2 random items
      if (category === "accessories" || category === "molly") {
        const numItems = Math.min(Math.floor(Math.random() * 2) + 1, items.length);
        const shuffledItems = [...items].sort(() => Math.random() - 0.5);
        const selectedItems = shuffledItems.slice(0, numItems);

        // Set as array
        state.selectedItems[category] = selectedItems;

        // Update UI to show selections
        const categorySection = document.querySelector(
          `[data-category="${category}"]`
        );
        if (categorySection) {
          const itemCards = categorySection.querySelectorAll(".item-card");
          itemCards.forEach((card) => {
            const img = card.querySelector(".item-image");
            if (selectedItems.some(item => img.src.endsWith(item))) {
              card.classList.add("selected");
            }
          });
        }
      } else {
        // Pick a single random item for other categories
        const randomItem = items[Math.floor(Math.random() * items.length)];

        // Select the item
        state.selectedItems[category] = randomItem;

        // Update UI to show selection
        const categorySection = document.querySelector(
          `[data-category="${category}"]`
        );
        if (categorySection) {
          const itemCards = categorySection.querySelectorAll(".item-card");
          itemCards.forEach((card) => {
            const img = card.querySelector(".item-image");
            if (img.src.endsWith(randomItem)) {
              card.classList.add("selected");
            }
          });
        }
      }
    }
  }

  // Update the outfit preview
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

// Dark mode functionality
function initDarkMode() {
  const themeToggleCheckbox = document.getElementById("theme-toggle-checkbox");

  // Check for saved theme preference or use system preference
  const savedTheme = localStorage.getItem("theme");
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;

  // Determine initial theme
  let isDarkMode = false;
  if (savedTheme) {
    // Use saved preference if it exists
    isDarkMode = savedTheme === "dark";
  } else {
    // Otherwise use system preference
    isDarkMode = prefersDark;
  }

  // Apply initial theme
  if (isDarkMode) {
    document.body.classList.add("dark-mode");
    themeToggleCheckbox.checked = true;
  }

  // Listen for toggle changes
  themeToggleCheckbox.addEventListener("change", function () {
    if (this.checked) {
      document.body.classList.add("dark-mode");
      localStorage.setItem("theme", "dark");
    } else {
      document.body.classList.remove("dark-mode");
      localStorage.setItem("theme", "light");
    }
  });

  // Listen for system theme changes (optional - updates if user changes system theme)
  window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", (e) => {
    // Only auto-switch if user hasn't set a manual preference
    if (!localStorage.getItem("theme")) {
      if (e.matches) {
        document.body.classList.add("dark-mode");
        themeToggleCheckbox.checked = true;
      } else {
        document.body.classList.remove("dark-mode");
        themeToggleCheckbox.checked = false;
      }
    }
  });
}

// Share modal functions
function openShareModal() {
  // Check if there are any selected items
  if (Object.keys(state.selectedItems).length === 0) {
    alert("Please select at least one item to share your outfit!");
    return;
  }
  shareModal.classList.add("active");
}

function closeShareModal() {
  shareModal.classList.remove("active");
}

// Capture outfit as image
async function captureOutfitImage() {
  const outfitElement = document.getElementById("outfit-preview");

  try {
    const canvas = await html2canvas(outfitElement, {
      backgroundColor: getComputedStyle(document.body).backgroundColor,
      scale: 2,
      logging: false,
      useCORS: true,
    });

    return canvas;
  } catch (error) {
    console.error("Error capturing outfit:", error);
    alert("Failed to capture outfit image. Please try again.");
    return null;
  }
}

// Convert canvas to blob
function canvasToBlob(canvas) {
  return new Promise((resolve) => {
    canvas.toBlob((blob) => {
      resolve(blob);
    }, "image/png");
  });
}

// Share via Email (to Hannah)
async function shareViaEmail() {
  const canvas = await captureOutfitImage();
  if (!canvas) return;

  // Convert canvas to data URL
  const imageDataURL = canvas.toDataURL("image/png");

  // Show loading state
  const shareEmailBtn = document.getElementById("share-email");
  const originalText = shareEmailBtn.innerHTML;
  shareEmailBtn.innerHTML =
    '<span class="share-icon">⏳</span><span>Sending...</span>';
  shareEmailBtn.disabled = true;

  try {
    // Send to backend API (use Heroku URL in production, localhost in development)
    const apiUrl = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
      ? "http://localhost:5000/send-outfit"
      : "https://dressup-email-server-e49ebc6db462.herokuapp.com/send-outfit";

    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-API-Secret": "7iSOJxNUg5XGr6dS9AOdQYmfgIzXK6AG3WFgC_wCy_Q"
      },
      body: JSON.stringify({
        image: imageDataURL,
      }),
    });

    const result = await response.json();

    if (result.success) {
      alert("Outfit sent to Hannah successfully! ✅");
      closeShareModal();
    } else {
      throw new Error(result.error || "Failed to send email");
    }
  } catch (error) {
    console.error("Error sending email:", error);
    alert(
      "Failed to send email. Make sure the email server is running (python email_server.py)"
    );
  } finally {
    // Restore button state
    shareEmailBtn.innerHTML = originalText;
    shareEmailBtn.disabled = false;
  }
}

// Share via Messages (SMS/iMessage)
async function shareViaMessages() {
  const canvas = await captureOutfitImage();
  if (!canvas) return;

  // Check if Web Share API is available
  if (navigator.share && navigator.canShare) {
    canvas.toBlob(async (blob) => {
      const file = new File([blob], "hannahbunnn-outfit.png", {
        type: "image/png",
      });

      try {
        await navigator.share({
          title: "Hannahbunnn's Outfit",
          text: "Check out this outfit from Hannahbunnn's Outfit Creator!",
          files: [file],
        });
      } catch (error) {
        if (error.name !== "AbortError") {
          console.error("Error sharing:", error);
          fallbackShare(canvas);
        }
      }
    });
  } else {
    fallbackShare(canvas);
  }

  closeShareModal();
}

// Fallback share method
function fallbackShare(canvas) {
  canvas.toBlob((blob) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "hannahbunnn-outfit.png";
    a.click();
    URL.revokeObjectURL(url);

    // alert('Image downloaded! You can now share it via your messaging app.');
  });
}

// Download outfit image
async function downloadOutfitImage() {
  const canvas = await captureOutfitImage();
  if (!canvas) return;

  canvas.toBlob((blob) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "hannahbunnn-outfit.png";
    a.click();
    URL.revokeObjectURL(url);
  });

  closeShareModal();
}

// Get API URL based on environment
function getApiUrl() {
  return window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? "http://localhost:5001"
    : "https://dressup-email-server-e49ebc6db462.herokuapp.com";
}

// Send outfit to OBS overlay
async function sendToOBS() {
  // Check if there are any selected items
  if (Object.keys(state.selectedItems).length === 0) {
    alert("Please select at least one item to send to OBS!");
    return;
  }

  const sendToObsBtn = document.getElementById("send-to-obs-btn");
  if (sendToObsBtn) {
    const originalText = sendToObsBtn.innerHTML;
    sendToObsBtn.innerHTML = "Sending...";
    sendToObsBtn.disabled = true;

    try {
      const response = await fetch(`${getApiUrl()}/obs/outfit`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          outfit: state.selectedItems,
        }),
      });

      const result = await response.json();

      if (result.success) {
        sendToObsBtn.innerHTML = "Sent!";
        setTimeout(() => {
          sendToObsBtn.innerHTML = originalText;
          sendToObsBtn.disabled = false;
        }, 1500);
      } else {
        throw new Error(result.error || "Failed to send to OBS");
      }
    } catch (error) {
      console.error("Error sending to OBS:", error);
      alert("Failed to send to OBS. Make sure the server is running.");
      sendToObsBtn.innerHTML = originalText;
      sendToObsBtn.disabled = false;
    }
  }
}

// Clear outfit from OBS overlay
async function clearOBS() {
  const clearObsBtn = document.getElementById("clear-obs-btn");
  if (clearObsBtn) {
    const originalText = clearObsBtn.innerHTML;
    clearObsBtn.innerHTML = "Clearing...";
    clearObsBtn.disabled = true;

    try {
      const response = await fetch(`${getApiUrl()}/obs/outfit`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const result = await response.json();

      if (result.success) {
        clearObsBtn.innerHTML = "Cleared!";
        setTimeout(() => {
          clearObsBtn.innerHTML = originalText;
          clearObsBtn.disabled = false;
        }, 1500);
      } else {
        throw new Error(result.error || "Failed to clear OBS");
      }
    } catch (error) {
      console.error("Error clearing OBS:", error);
      alert("Failed to clear OBS. Make sure the server is running.");
      clearObsBtn.innerHTML = originalText;
      clearObsBtn.disabled = false;
    }
  }
}

// Copy OBS URL to clipboard
function copyOBSUrl() {
  const baseUrl = window.location.href.replace(/\/[^\/]*$/, '/');
  const obsUrl = baseUrl + 'obs.html';

  navigator.clipboard.writeText(obsUrl).then(() => {
    const copyBtn = document.getElementById("copy-obs-url-btn");
    if (copyBtn) {
      const originalText = copyBtn.innerHTML;
      copyBtn.innerHTML = "Copied!";
      copyBtn.disabled = true;

      setTimeout(() => {
        copyBtn.innerHTML = originalText;
        copyBtn.disabled = false;
      }, 1500);
    }
  }).catch((err) => {
    console.error("Failed to copy URL:", err);
    alert("OBS URL: " + obsUrl);
  });
}

// Initialize the app when DOM is loaded
document.addEventListener("DOMContentLoaded", init);
