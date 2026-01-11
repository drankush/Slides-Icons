/**
 * OpenIcons PowerPoint Add-in
 * Core JavaScript for browsing and inserting icons from multiple libraries
 */

// State variables
let currentLibrary = 'healthicons';
let currentManifest = null;
let currentStyle = 'filled';
let currentSize = 96;
let currentCategory = 'all';

// Initialize Office.js (or standalone mode for browser testing)
Office.onReady((info) => {
    if (info.host === Office.HostType.PowerPoint) {
        console.log('Office.js is ready - PowerPoint mode');
        initializeApp();
    } else {
        // Standalone browser mode for development/testing
        console.log('Running in standalone browser mode');
        initializeApp();
    }
});

/**
 * Initialize the application
 */
async function initializeApp() {
    console.log('Initializing OpenIcons add-in...');

    // Set up event listeners
    setupEventListeners();

    // Load initial library
    await loadLibrary(currentLibrary);
}

/**
 * Set up event listeners
 */
function setupEventListeners() {
    // Library selector
    const librarySelect = document.getElementById('librarySelect');
    librarySelect.addEventListener('change', async (e) => {
        currentLibrary = e.target.value;
        currentCategory = 'all';
        await loadLibrary(currentLibrary);
    });

    // Search input
    const searchInput = document.getElementById('searchInput');
    searchInput.addEventListener('input', debounce(handleSearch, 200));

    // Size select
    const sizeSelect = document.getElementById('sizeSelect');
    sizeSelect.addEventListener('change', (e) => {
        currentSize = parseInt(e.target.value);
    });
}

/**
 * Load a library and its manifest
 */
async function loadLibrary(libraryId) {
    const library = getLibrary(libraryId);
    if (!library) {
        showStatus(`Unknown library: ${libraryId}`, 'error');
        return;
    }

    showLoading(true);

    try {
        // Update library info
        updateLibraryInfo(library);

        // Update style buttons
        updateStyleButtons(library);

        // Load manifest
        const response = await fetch(library.manifestUrl);
        if (!response.ok) throw new Error(`Failed to load manifest`);
        currentManifest = await response.json();

        console.log(`Loaded ${library.name}: ${currentManifest.totalIcons} icons`);

        // Reset current style to library default
        currentStyle = library.defaultStyle;

        // Render UI
        renderCategories();
        renderIcons();

    } catch (error) {
        console.error(`Failed to load ${libraryId}:`, error);
        showStatus(`Failed to load ${library.name}`, 'error');
        currentManifest = { icons: {} };
        renderCategories();
        renderIcons();
    } finally {
        showLoading(false);
    }
}

/**
 * Update library info display
 */
function updateLibraryInfo(library) {
    const infoEl = document.getElementById('libraryInfo');
    infoEl.innerHTML = `
        <span class="library-badge">${library.license}</span>
        <a href="${library.website}" target="_blank" class="library-link">Website ↗</a>
    `;
}

/**
 * Update style toggle buttons based on library
 */
function updateStyleButtons(library) {
    const toggleGroup = document.getElementById('styleToggle');

    toggleGroup.innerHTML = library.styles.map((style, index) => `
        <button class="toggle-btn ${index === 0 ? 'active' : ''}" data-style="${style.id}">
            ${style.name}
        </button>
    `).join('');

    // Set current style to first available
    currentStyle = library.styles[0].id;

    // Add click handlers
    toggleGroup.querySelectorAll('.toggle-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            toggleGroup.querySelectorAll('.toggle-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentStyle = btn.dataset.style;
            renderIcons();
        });
    });
}

/**
 * Show/hide loading overlay
 */
function showLoading(show) {
    const overlay = document.getElementById('loadingOverlay');
    overlay.classList.toggle('hidden', !show);
}

/**
 * Debounce utility function
 */
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

/**
 * Handle search input
 */
function handleSearch(event) {
    const query = event.target.value.toLowerCase().trim();
    renderIcons(query);
}

/**
 * Render category buttons
 */
function renderCategories() {
    const categoryList = document.getElementById('categoryList');

    if (!currentManifest || !currentManifest.icons) {
        categoryList.innerHTML = '<span class="loading">Loading categories</span>';
        return;
    }

    // Filter out 'all' from manifest keys to avoid duplicate
    const manifestCategories = Object.keys(currentManifest.icons).filter(cat => cat !== 'all');
    const categories = ['all', ...manifestCategories];

    categoryList.innerHTML = categories.map(cat => `
        <button class="category-btn ${cat === currentCategory ? 'active' : ''}" data-category="${cat}">
            ${formatCategoryName(cat)}
        </button>
    `).join('');

    // Add click handlers
    categoryList.querySelectorAll('.category-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.category-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentCategory = btn.dataset.category;
            document.getElementById('currentCategory').textContent = formatCategoryName(currentCategory);
            renderIcons();
        });
    });
}

/**
 * Format category name for display
 */
function formatCategoryName(name) {
    if (name === 'all') return 'All Icons';
    if (name === 'ppe') return 'PPE';
    return name.charAt(0).toUpperCase() + name.slice(1).replace(/-/g, ' ');
}

/**
 * Render icons grid
 */
function renderIcons(searchQuery = '') {
    const iconsGrid = document.getElementById('iconsGrid');
    const iconCount = document.getElementById('iconCount');
    const library = getLibrary(currentLibrary);

    if (!currentManifest || !currentManifest.icons) {
        iconsGrid.innerHTML = '<div class="loading">Loading icons</div>';
        return;
    }

    // Get icons based on current category and search
    let icons = [];

    if (currentCategory === 'all') {
        Object.keys(currentManifest.icons).forEach(cat => {
            const catIcons = currentManifest.icons[cat] || [];
            catIcons.forEach(icon => {
                icons.push({ ...icon, category: cat });
            });
        });
    } else {
        icons = (currentManifest.icons[currentCategory] || []).map(icon => ({
            ...icon,
            category: currentCategory
        }));
    }

    // Filter by search query
    if (searchQuery) {
        icons = icons.filter(icon =>
            icon.name.toLowerCase().includes(searchQuery) ||
            (icon.title && icon.title.toLowerCase().includes(searchQuery)) ||
            (icon.keywords && icon.keywords.some(k => k.toLowerCase().includes(searchQuery)))
        );
    }

    // Update count
    iconCount.textContent = `${icons.length} icons`;

    // Render icons
    if (icons.length === 0) {
        iconsGrid.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">🔍</div>
                <p>No icons found</p>
            </div>
        `;
        return;
    }

    // Limit display to prevent performance issues
    const displayIcons = icons.slice(0, 200);

    iconsGrid.innerHTML = displayIcons.map(icon => {
        const iconUrl = library.getIconUrl(icon.name, currentStyle, icon.category);
        const title = icon.title || formatCategoryName(icon.name);

        return `
            <div class="icon-item" 
                 data-name="${icon.name}"
                 data-category="${icon.category}"
                 data-url="${iconUrl}"
                 title="${title}">
                <img src="${iconUrl}" alt="${icon.name}" loading="lazy" onerror="this.parentElement.style.display='none'">
            </div>
        `;
    }).join('');

    if (icons.length > 200) {
        iconsGrid.innerHTML += `<div class="icon-limit-message">Showing 200 of ${icons.length} icons. Use search to filter.</div>`;
    }

    // Add click handlers
    iconsGrid.querySelectorAll('.icon-item').forEach(item => {
        item.addEventListener('click', () => insertIcon(item));
    });
}

/**
 * Insert icon into PowerPoint slide
 */
async function insertIcon(iconElement) {
    const iconName = iconElement.dataset.name;
    const iconCategory = iconElement.dataset.category;
    const iconUrl = iconElement.dataset.url;
    const library = getLibrary(currentLibrary);

    // Add visual feedback
    iconElement.classList.add('inserting');

    try {
        let svgContent;

        // For local icons, fetch directly. For CDN, use cache helper
        if (library.isLocal) {
            const response = await fetch(iconUrl);
            svgContent = await response.text();
        } else {
            svgContent = await fetchIconSvg(currentLibrary, iconName, currentStyle, iconCategory);
        }

        // Convert SVG to PNG base64
        const base64 = await svgToBase64PNG(svgContent, currentSize);

        // Insert into PowerPoint
        await insertImageAsync(base64);

        showStatus(`Inserted: ${formatCategoryName(iconName)}`, 'success');
    } catch (error) {
        console.error('Failed to insert icon:', error);
        showStatus('Failed to insert icon', 'error');
    } finally {
        iconElement.classList.remove('inserting');
    }
}

/**
 * Convert SVG to Base64 PNG using Canvas
 */
function svgToBase64PNG(svgContent, size) {
    return new Promise((resolve, reject) => {
        const canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');

        const img = new Image();
        const svgBlob = new Blob([svgContent], { type: 'image/svg+xml;charset=utf-8' });
        const url = URL.createObjectURL(svgBlob);

        img.onload = () => {
            ctx.drawImage(img, 0, 0, size, size);
            URL.revokeObjectURL(url);

            // Get base64 without the data URL prefix
            const dataUrl = canvas.toDataURL('image/png');
            const base64 = dataUrl.split(',')[1];
            resolve(base64);
        };

        img.onerror = (error) => {
            URL.revokeObjectURL(url);
            reject(error);
        };

        img.src = url;
    });
}

/**
 * Insert base64 image into PowerPoint
 */
function insertImageAsync(base64) {
    return new Promise((resolve, reject) => {
        Office.context.document.setSelectedDataAsync(
            base64,
            {
                coercionType: Office.CoercionType.Image,
                imageLeft: 100,
                imageTop: 100,
                imageWidth: currentSize,
                imageHeight: currentSize
            },
            (result) => {
                if (result.status === Office.AsyncResultStatus.Succeeded) {
                    resolve();
                } else {
                    reject(new Error(result.error.message));
                }
            }
        );
    });
}

/**
 * Show status message
 */
function showStatus(message, type = 'info') {
    const statusEl = document.getElementById('statusMessage');
    statusEl.textContent = message;
    statusEl.className = `status-message visible ${type}`;

    setTimeout(() => {
        statusEl.classList.remove('visible');
    }, 2000);
}
