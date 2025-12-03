// OBS Overlay Script
// Fetches outfit data from server and displays it

const POLL_INTERVAL = 2000; // Check for updates every 2 seconds

let currentOutfit = null;

// Get API URL based on environment
function getApiUrl() {
    return window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
        ? "http://localhost:5001"
        : "https://dressup-email-server-e49ebc6db462.herokuapp.com";
}

// Parse URL parameters for customization
function getUrlParams() {
    const params = new URLSearchParams(window.location.search);
    return {
        layout: params.get('layout') || 'vertical', // horizontal, vertical, grid
        size: params.get('size') || 'medium', // small, medium, large
        theme: params.get('theme') || 'transparent', // dark, light, transparent
        position: params.get('position') || 'center', // top-left, top-right, bottom-left, bottom-right, center
        labels: params.get('labels') !== 'false', // show labels by default
        compact: params.get('compact') === 'true' // compact mode
    };
}

// Apply URL parameters as CSS classes
function applyStyles() {
    const params = getUrlParams();
    const body = document.body;

    // Clear existing style classes
    body.className = '';

    // Apply layout
    body.classList.add(`layout-${params.layout}`);

    // Apply size
    if (params.size !== 'medium') {
        body.classList.add(`size-${params.size}`);
    }

    // Apply theme
    body.classList.add(`theme-${params.theme}`);

    // Apply position
    body.classList.add(`position-${params.position}`);

    // Apply labels toggle
    if (!params.labels) {
        body.classList.add('no-labels');
    }

    // Apply compact mode
    if (params.compact) {
        body.classList.add('compact');
    }
}

// Render the outfit display
function renderOutfit(outfitData) {
    const display = document.getElementById('outfit-display');

    if (!outfitData || Object.keys(outfitData).length === 0) {
        display.innerHTML = '<p class="waiting-state">Waiting for outfit...</p>';
        display.classList.add('empty');
        return;
    }

    display.classList.remove('empty');
    display.innerHTML = '';

    // Render each outfit item
    Object.entries(outfitData).forEach(([category, itemData]) => {
        // Handle accessories as array, other categories as single item
        if (category === 'accessories' && Array.isArray(itemData)) {
            itemData.forEach((itemFilename) => {
                const outfitItem = createOutfitItem(category, itemFilename);
                display.appendChild(outfitItem);
            });
        } else if (typeof itemData === 'string') {
            const outfitItem = createOutfitItem(category, itemData);
            display.appendChild(outfitItem);
        }
    });
}

// Create an outfit item element
function createOutfitItem(category, itemFilename) {
    const outfitItem = document.createElement('div');
    outfitItem.className = 'outfit-item';

    const label = document.createElement('div');
    label.className = 'outfit-item-label';
    label.textContent = category;

    const img = document.createElement('img');
    img.className = 'outfit-item-image';
    img.src = `clothes/${category}/${itemFilename}`;
    img.alt = `${category} - ${itemFilename}`;
    img.loading = 'eager';

    // Handle image load errors
    img.onerror = () => {
        img.style.display = 'none';
        label.style.display = 'none';
    };

    outfitItem.appendChild(label);
    outfitItem.appendChild(img);

    return outfitItem;
}

// Fetch outfit from server
async function fetchOutfit() {
    try {
        const response = await fetch(`${getApiUrl()}/obs/outfit`);
        const data = await response.json();

        if (data.success) {
            return data.outfit;
        }
        return null;
    } catch (error) {
        console.error('Error fetching outfit:', error);
        return null;
    }
}

// Check for outfit updates
async function checkForUpdates() {
    try {
        const outfitData = await fetchOutfit();
        const outfitString = JSON.stringify(outfitData);
        const currentString = JSON.stringify(currentOutfit);

        // Only re-render if outfit has changed
        if (outfitString !== currentString) {
            currentOutfit = outfitData;
            renderOutfit(outfitData);
        }
    } catch (error) {
        console.error('Error checking for updates:', error);
    }
}

// Initialize
function init() {
    applyStyles();
    checkForUpdates();

    // Poll for updates from server
    setInterval(checkForUpdates, POLL_INTERVAL);

    // Log helpful info for streamers
    console.log('OBS Outfit Overlay loaded!');
    console.log(`Fetching from: ${getApiUrl()}`);
    console.log('Customization options (add to URL):');
    console.log('  ?layout=horizontal|vertical|grid');
    console.log('  ?size=small|medium|large');
    console.log('  ?theme=dark|light|transparent');
    console.log('  ?position=center|top-left|top-right|bottom-left|bottom-right');
    console.log('  ?labels=true|false');
    console.log('  ?compact=true|false');
    console.log('Example: obs.html?layout=vertical&size=small&theme=light');
}

// Start when DOM is ready
document.addEventListener('DOMContentLoaded', init);
