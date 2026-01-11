/**
 * Slides Icons - PowerPoint Add-in
 * Hybrid CDN approach: Load manifests, fetch SVGs on-demand
 */

// Available icon libraries
const ICON_LIBRARIES = [
    { id: 'bootstrap', name: 'Bootstrap Icons' },
    { id: 'heroicons', name: 'Heroicons' },
    { id: 'feather', name: 'Feather Icons' },
    { id: 'lucide', name: 'Lucide Icons' },
    { id: 'tabler', name: 'Tabler Icons' },
    { id: 'ionicons', name: 'Ionicons' },
    { id: 'iconoir', name: 'Iconoir' },
    { id: 'phosphor', name: 'Phosphor Icons' },
    { id: 'boxicons', name: 'Boxicons' },
    { id: 'octicons', name: 'GitHub Octicons' },
    { id: 'radix', name: 'Radix Icons' },
    { id: 'eva', name: 'Eva Icons' }
];

// State
let currentLibrary = 'bootstrap';
let currentManifest = null;
let iconSize = 48;
let iconColor = '#000000';
let svgCache = {};

// Initialize on Office ready or browser mode
Office.onReady((info) => {
    console.log('Office ready:', info.host || 'browser');
    initializeApp();
});

/**
 * Initialize the app
 */
async function initializeApp() {
    console.log('Initializing Slides Icons...');

    // Render library sidebar
    renderLibraryList();

    // Set up event listeners
    setupEventListeners();

    // Load first library
    await loadLibrary('bootstrap');
}

/**
 * Render the library sidebar
 */
function renderLibraryList() {
    const list = document.getElementById('libraryList');

    list.innerHTML = ICON_LIBRARIES.map(lib => `
        <div class="library-item" data-id="${lib.id}">
            <span>${lib.name}</span>
            <span class="count">...</span>
        </div>
    `).join('');

    // Add click handlers
    list.querySelectorAll('.library-item').forEach(item => {
        item.addEventListener('click', () => loadLibrary(item.dataset.id));
    });
}

/**
 * Set up event listeners
 */
function setupEventListeners() {
    // Search
    const searchInput = document.getElementById('searchInput');
    searchInput.addEventListener('input', debounce(handleSearch, 200));

    // Size
    document.getElementById('sizeSelect').addEventListener('change', (e) => {
        iconSize = parseInt(e.target.value);
    });

    // Color
    document.getElementById('colorPicker').addEventListener('input', (e) => {
        iconColor = e.target.value;
        applyColorToGrid();
    });
}

/**
 * Load a library manifest
 */
async function loadLibrary(libraryId) {
    // Update UI
    document.querySelectorAll('.library-item').forEach(item => {
        item.classList.toggle('active', item.dataset.id === libraryId);
    });

    const lib = ICON_LIBRARIES.find(l => l.id === libraryId);
    document.getElementById('currentLibrary').textContent = lib?.name || libraryId;
    currentLibrary = libraryId;

    // Show loading
    showLoading(true);

    try {
        // Load manifest
        const response = await fetch(`manifests/${libraryId}.json`);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);

        currentManifest = await response.json();

        // Update count in sidebar
        const item = document.querySelector(`.library-item[data-id="${libraryId}"]`);
        if (item) {
            item.querySelector('.count').textContent = currentManifest.totalIcons;
        }

        // Update total count
        updateTotalCount();

        // Render icons
        renderIcons();

        console.log(`Loaded ${libraryId}: ${currentManifest.totalIcons} icons`);

    } catch (error) {
        console.error('Failed to load library:', error);
        showToast('Failed to load library', 'error');
    } finally {
        showLoading(false);
    }
}

/**
 * Update total icon count
 */
function updateTotalCount() {
    // For now, show current library count
    document.getElementById('totalCount').textContent = currentManifest?.totalIcons || 0;
}

/**
 * Render icons grid
 */
function renderIcons(filter = '') {
    const grid = document.getElementById('iconsGrid');
    const countEl = document.getElementById('iconCount');

    if (!currentManifest || !currentManifest.icons) {
        grid.innerHTML = '<div class="empty-state">No icons loaded</div>';
        return;
    }

    let icons = currentManifest.icons;

    // Filter by search
    if (filter) {
        const q = filter.toLowerCase();
        icons = icons.filter(icon =>
            icon.name.toLowerCase().includes(q) ||
            icon.title.toLowerCase().includes(q)
        );
    }

    countEl.textContent = `${icons.length} icons`;

    if (icons.length === 0) {
        grid.innerHTML = '<div class="empty-state">No icons found</div>';
        return;
    }

    // Limit for performance
    const displayIcons = icons.slice(0, 200);

    grid.innerHTML = displayIcons.map(icon => `
        <div class="icon-item" data-name="${icon.name}" title="${icon.title}">
            <div class="icon-placeholder" data-name="${icon.name}">
                <div class="mini-spinner"></div>
            </div>
        </div>
    `).join('');

    if (icons.length > 200) {
        grid.innerHTML += `<div class="icon-limit-message">Showing 200 of ${icons.length}. Use search to filter.</div>`;
    }

    // Load SVGs lazily
    loadVisibleIcons();

    // Add click handlers
    grid.querySelectorAll('.icon-item').forEach(item => {
        item.addEventListener('click', () => insertIcon(item));
    });
}

/**
 * Load visible icons
 */
async function loadVisibleIcons() {
    const placeholders = document.querySelectorAll('.icon-placeholder');

    for (const placeholder of placeholders) {
        const iconName = placeholder.dataset.name;

        try {
            const svg = await fetchSvg(iconName);
            if (svg && placeholder.isConnected) {
                placeholder.innerHTML = svg;
                applyColorToElement(placeholder);
            }
        } catch (error) {
            placeholder.innerHTML = '⚠';
        }
    }
}

/**
 * Fetch SVG from CDN
 */
async function fetchSvg(iconName) {
    if (!currentManifest || !currentManifest.cdnPattern) {
        return null;
    }

    const cacheKey = `${currentLibrary}:${iconName}`;

    // Check cache
    if (svgCache[cacheKey]) {
        return svgCache[cacheKey];
    }

    // Build URL from pattern
    const url = currentManifest.cdnPattern.replace('{name}', iconName);

    try {
        const response = await fetch(url);
        if (!response.ok) return null;

        const svg = await response.text();
        svgCache[cacheKey] = svg;
        return svg;
    } catch (error) {
        console.error(`Failed to fetch ${iconName}:`, error);
        return null;
    }
}

/**
 * Apply color to all icons
 */
function applyColorToGrid() {
    document.querySelectorAll('.icon-placeholder').forEach(applyColorToElement);
}

/**
 * Apply color to a single element
 */
function applyColorToElement(el) {
    const svg = el.querySelector('svg');
    if (svg) {
        svg.style.fill = iconColor;
        svg.style.color = iconColor;
        svg.setAttribute('fill', 'currentColor');
    }
}

/**
 * Handle search input
 */
function handleSearch(e) {
    renderIcons(e.target.value);
}

/**
 * Insert icon into PowerPoint
 */
async function insertIcon(element) {
    const iconName = element.dataset.name;
    const placeholder = element.querySelector('.icon-placeholder');
    const svgContent = placeholder?.innerHTML;

    if (!svgContent || svgContent.includes('spinner')) {
        showToast('Icon still loading...', 'error');
        return;
    }

    element.classList.add('inserting');

    try {
        // Convert SVG to PNG
        const base64 = await svgToBase64PNG(svgContent, iconSize, iconColor);

        // Insert into PowerPoint
        await insertImageAsync(base64);

        showToast(`Inserted: ${iconName}`, 'success');
    } catch (error) {
        console.error('Insert failed:', error);
        showToast('Insert failed', 'error');
    } finally {
        element.classList.remove('inserting');
    }
}

/**
 * Convert SVG to PNG base64
 */
function svgToBase64PNG(svgContent, size, color) {
    return new Promise((resolve, reject) => {
        // Apply color to SVG
        let coloredSvg = svgContent
            .replace(/fill="[^"]*"/g, `fill="${color}"`)
            .replace(/stroke="[^"]*"/g, `stroke="${color}"`);

        // Ensure SVG has proper attributes
        if (!coloredSvg.includes('xmlns')) {
            coloredSvg = coloredSvg.replace('<svg', '<svg xmlns="http://www.w3.org/2000/svg"');
        }

        const canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');

        const img = new Image();
        const blob = new Blob([coloredSvg], { type: 'image/svg+xml;charset=utf-8' });
        const url = URL.createObjectURL(blob);

        img.onload = () => {
            ctx.drawImage(img, 0, 0, size, size);
            URL.revokeObjectURL(url);
            const dataUrl = canvas.toDataURL('image/png');
            resolve(dataUrl.split(',')[1]);
        };

        img.onerror = (error) => {
            URL.revokeObjectURL(url);
            reject(error);
        };

        img.src = url;
    });
}

/**
 * Insert image into PowerPoint
 */
function insertImageAsync(base64) {
    return new Promise((resolve, reject) => {
        if (!Office.context?.document) {
            // Browser mode - just log
            console.log('Would insert image (browser mode)');
            resolve();
            return;
        }

        Office.context.document.setSelectedDataAsync(
            base64,
            {
                coercionType: Office.CoercionType.Image,
                imageLeft: 100,
                imageTop: 100,
                imageWidth: iconSize,
                imageHeight: iconSize
            },
            (result) => {
                if (result.status === Office.AsyncResultStatus.Succeeded) {
                    resolve();
                } else {
                    reject(new Error(result.error?.message || 'Insert failed'));
                }
            }
        );
    });
}

/**
 * Show/hide loading state
 */
function showLoading(show) {
    const grid = document.getElementById('iconsGrid');
    if (show) {
        grid.innerHTML = '<div class="loading-state"><div class="spinner"></div><p>Loading icons...</p></div>';
    }
}

/**
 * Show toast notification
 */
function showToast(message, type = 'info') {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.className = `toast visible ${type}`;

    setTimeout(() => {
        toast.classList.remove('visible');
    }, 2000);
}

/**
 * Debounce utility
 */
function debounce(fn, delay) {
    let timeout;
    return (...args) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => fn(...args), delay);
    };
}
