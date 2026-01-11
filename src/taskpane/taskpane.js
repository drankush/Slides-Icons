/**
 * Health Icons PowerPoint Add-in
 * Core JavaScript for browsing and inserting icons
 */

// Icon manifest - will be populated with actual icon data
let iconManifest = null;
let currentStyle = 'filled';
let currentSize = 96;
let currentCategory = 'all';

// Initialize Office.js
Office.onReady((info) => {
    if (info.host === Office.HostType.PowerPoint) {
        console.log('Office.js is ready');
        initializeApp();
    }
});

/**
 * Initialize the application
 */
async function initializeApp() {
    console.log('Initializing Health Icons add-in...');

    // Load icon manifest
    await loadIconManifest();

    // Set up event listeners
    setupEventListeners();

    // Render initial UI
    renderCategories();
    renderIcons();
}

/**
 * Load the icon manifest JSON
 */
async function loadIconManifest() {
    try {
        const response = await fetch('icons/manifest.json');
        iconManifest = await response.json();
        console.log(`Loaded ${Object.keys(iconManifest.icons).length} icon categories`);
    } catch (error) {
        console.error('Failed to load icon manifest:', error);
        showStatus('Failed to load icons', 'error');
    }
}

/**
 * Set up event listeners
 */
function setupEventListeners() {
    // Search input
    const searchInput = document.getElementById('searchInput');
    searchInput.addEventListener('input', debounce(handleSearch, 200));

    // Style toggle buttons
    document.querySelectorAll('.toggle-btn[data-style]').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.toggle-btn[data-style]').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentStyle = btn.dataset.style;
            renderIcons();
        });
    });

    // Size select
    const sizeSelect = document.getElementById('sizeSelect');
    sizeSelect.addEventListener('change', (e) => {
        currentSize = parseInt(e.target.value);
    });
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
    if (!iconManifest) {
        categoryList.innerHTML = '<span class="loading">Loading categories</span>';
        return;
    }

    const categories = ['all', ...Object.keys(iconManifest.icons)];

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
    return name.charAt(0).toUpperCase() + name.slice(1);
}

/**
 * Render icons grid
 */
function renderIcons(searchQuery = '') {
    const iconsGrid = document.getElementById('iconsGrid');
    const iconCount = document.getElementById('iconCount');

    if (!iconManifest) {
        iconsGrid.innerHTML = '<div class="loading">Loading icons</div>';
        return;
    }

    // Get icons based on current category and search
    let icons = [];

    if (currentCategory === 'all') {
        Object.keys(iconManifest.icons).forEach(cat => {
            iconManifest.icons[cat].forEach(icon => {
                icons.push({ ...icon, category: cat });
            });
        });
    } else {
        icons = (iconManifest.icons[currentCategory] || []).map(icon => ({
            ...icon,
            category: currentCategory
        }));
    }

    // Filter by search query
    if (searchQuery) {
        icons = icons.filter(icon =>
            icon.name.toLowerCase().includes(searchQuery) ||
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

    iconsGrid.innerHTML = icons.map(icon => {
        const iconPath = `icons/${currentStyle}/${icon.category}/${icon.name}.svg`;
        return `
            <div class="icon-item" 
                 data-path="${iconPath}" 
                 data-name="${icon.name}"
                 title="${formatCategoryName(icon.name)}">
                <img src="${iconPath}" alt="${icon.name}" loading="lazy">
            </div>
        `;
    }).join('');

    // Add click handlers
    iconsGrid.querySelectorAll('.icon-item').forEach(item => {
        item.addEventListener('click', () => insertIcon(item));
    });
}

/**
 * Insert icon into PowerPoint slide
 */
async function insertIcon(iconElement) {
    const iconPath = iconElement.dataset.path;
    const iconName = iconElement.dataset.name;

    // Add visual feedback
    iconElement.classList.add('inserting');

    try {
        // Fetch SVG content
        const svgResponse = await fetch(iconPath);
        const svgContent = await svgResponse.text();

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
