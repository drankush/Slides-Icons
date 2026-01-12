/**
 * Slides Icons - PowerPoint Add-in
 * Local JSON Manifests + Light Theme + BG Color
 */

// State
let allLibraries = [];
let currentLibrary = '';
let currentManifest = null;
let iconSize = 48;
let iconColor = '#000000';
let bgColor = '#ffffff';
let bgEnabled = false;

// Initialize
Office.onReady((info) => {
    console.log('Office ready:', info.host || 'browser');
    initializeApp();
});

async function initializeApp() {
    console.log('Initializing Slides Icons...');

    setupEventListeners();
    await loadLibraryIndex();
}

function setupEventListeners() {
    // Search
    const searchInput = document.getElementById('searchInput');
    searchInput.addEventListener('input', () => {
        // Simple debounce
        clearTimeout(searchInput.timeout);
        searchInput.timeout = setTimeout(() => renderIcons(), 200);
    });

    // Size
    const sizeSelect = document.getElementById('sizeSelect');
    sizeSelect.addEventListener('change', (e) => {
        iconSize = parseInt(e.target.value);
        // Update CSS variable for grid preview
        document.documentElement.style.setProperty('--icon-size', `${iconSize}px`);
    });

    // Icon Color
    const colorPicker = document.getElementById('colorPicker');
    colorPicker.addEventListener('input', (e) => {
        iconColor = e.target.value;
        applyStylesToGrid();
    });

    // BG Color
    const bgPicker = document.getElementById('bgColorPicker');
    const bgCheckbox = document.getElementById('bgEnabled');

    bgCheckbox.addEventListener('change', (e) => {
        bgEnabled = e.target.checked;
        bgPicker.disabled = !bgEnabled;
        applyStylesToGrid();
    });

    bgPicker.addEventListener('input', (e) => {
        bgColor = e.target.value;
        applyStylesToGrid();
    });

    // Sidebar Toggle
    const toggleBtn = document.getElementById('toggleSidebar');
    if (toggleBtn) {
        toggleBtn.addEventListener('click', () => {
            document.body.classList.toggle('sidebar-collapsed');
        });
    }
}

/**
 * Load list of available libraries from index.json
 */
async function loadLibraryIndex() {
    try {
        const response = await fetch('manifests/index.json');
        if (!response.ok) throw new Error('Failed to load library index');

        allLibraries = await response.json();
        renderLibraryList();

        const initialLib = allLibraries.find(l => l.id === 'bootstrap') || allLibraries[0];
        if (initialLib) {
            loadLibrary(initialLib.id);
        }
    } catch (error) {
        console.error('Index load failed:', error);
        document.getElementById('libraryList').innerHTML = '<div class="error">Failed to load libraries.</div>';
    }
}

function renderLibraryList() {
    const list = document.getElementById('libraryList');
    list.innerHTML = allLibraries.map(lib => `
        <div class="library-item" data-id="${lib.id}">
            <span class="name">${lib.name}</span>
            <span class="count">${lib.totalIcons}</span>
        </div>
    `).join('');

    list.querySelectorAll('.library-item').forEach(item => {
        item.addEventListener('click', () => loadLibrary(item.dataset.id));
    });
}

async function loadLibrary(id) {
    document.querySelectorAll('.library-item').forEach(el => {
        el.classList.toggle('active', el.dataset.id === id);
    });

    currentLibrary = id;
    showLoading(true);

    try {
        const response = await fetch(`manifests/${id}.json`);
        if (!response.ok) throw new Error(`Failed to load ${id}`);

        currentManifest = await response.json();

        const libInfo = allLibraries.find(l => l.id === id);
        if (libInfo) {
            document.getElementById('currentLibrary').textContent = libInfo.name;
            document.getElementById('totalCount').textContent = currentManifest.totalIcons;
        }

        renderIcons();

    } catch (error) {
        console.error(`Load library ${id} failed:`, error);
        showToast(`Failed to load ${id}`, 'error');
    } finally {
        showLoading(false);
    }
}

function renderIcons() {
    const grid = document.getElementById('iconsGrid');
    const searchVal = document.getElementById('searchInput').value.toLowerCase();

    if (!currentManifest || !currentManifest.icons) return;

    let icons = currentManifest.icons;

    if (searchVal) {
        icons = icons.filter(i => i.name.toLowerCase().includes(searchVal) ||
            (i.title && i.title.toLowerCase().includes(searchVal)));
    }

    const footer = document.getElementById('iconCount');
    if (icons.length > 0) {
        let msg = `${icons.length} icons`;
        if (icons.length > 300) {
            msg += ' • Use search to see more';
        }
        footer.textContent = msg;
    } else {
        footer.textContent = '0 icons';
    }

    const displayIcons = icons.slice(0, 300);

    if (displayIcons.length === 0) {
        grid.innerHTML = '<div class="empty-state">No icons found</div>';
        return;
    }

    // Check if manifest uses CDN pattern or embedded SVG
    const hasCdn = !!currentManifest.cdnPattern;

    grid.innerHTML = displayIcons.map(icon => {
        if (hasCdn) {
            const url = getIconUrl(currentManifest, icon.name);

            // Universal robust rendering: Use IMG tag with drop-shadow filter
            // This bypasses mask-image issues (e.g. Ionicons no-dims) and ensures visibility
            return `
                <div class="icon-item" data-name="${icon.name}">
                    <div class="icon-preview">
                        <img src="${url}" alt="${icon.title}" loading="lazy" class="icon-img-shadowed">
                    </div>
                </div>
            `;
        } else {
            // Embedded SVG: render inline (skip if content is not a string)
            let svgHtml = '';
            if (typeof icon.svg === 'string') {
                svgHtml = icon.svg;
            } else if (icon.svg && typeof icon.svg.content === 'string') {
                svgHtml = `<svg viewBox="${icon.svg.viewBox || '0 0 24 24'}" xmlns="http://www.w3.org/2000/svg">${icon.svg.content}</svg>`;
            }
            // Skip rendering if no valid SVG content
            if (!svgHtml) return '';
            return `
                <div class="icon-item" data-name="${icon.name}">
                    <div class="icon-preview">
                        ${svgHtml}
                    </div>
                </div>
            `;
        }
    }).join('');

    if (icons.length > 300) {
        grid.innerHTML += `<div class="icon-limit-message">Showing 300 of ${icons.length}</div>`;
    }

    applyStylesToGrid();

    grid.querySelectorAll('.icon-item').forEach(item => {
        item.addEventListener('click', () => insertIcon(item));
    });
}

// Get icon URL from CDN pattern
function getIconUrl(manifest, name) {
    if (!manifest.cdnPattern) return null;
    return manifest.cdnPattern.replace('{name}', name);
}

function applyStylesToGrid() {
    const grid = document.getElementById('iconsGrid');

    // Multi-color libraries that should NOT have currentColor applied
    // These have designed color schemes (logos, flags, crypto coins, etc.)
    const MULTI_COLOR_LIBS = ['crypto', 'flag', 'antdm', 'logos', 'simple', 'dev', 'payment', 'file'];

    // Stroke-based libraries where we should NOT add fill
    const STROKE_LIBS = ['tabler', 'tiny', 'feather', 'lucide'];

    const isMultiColor = currentManifest && MULTI_COLOR_LIBS.includes(currentManifest.id);
    const isStrokeBased = currentManifest && STROKE_LIBS.includes(currentManifest.id);

    // Apply icon color to container to cascade to currentColor
    grid.style.color = iconColor;

    // For embedded SVGs, apply currentColor based on library type
    grid.querySelectorAll('svg').forEach(svg => {
        if (isMultiColor) {
            // Don't modify multi-color icons - keep original colors
            return;
        }

        if (isStrokeBased) {
            // For stroke-based icons: only set stroke, don't touch fill
            svg.querySelectorAll('path, circle, rect, polygon, line, polyline, ellipse').forEach(el => {
                const stroke = el.getAttribute('stroke');
                if (stroke && stroke !== 'none') {
                    el.style.stroke = 'currentColor';
                }
            });
            return;
        }

        // Default: fill-based icons (Bootstrap, Font Awesome, etc.)
        const rootFill = svg.getAttribute('fill');
        if (rootFill !== 'none') {
            svg.style.fill = 'currentColor';
        }

        svg.querySelectorAll('path, circle, rect, polygon, line, polyline, ellipse, g').forEach(el => {
            const fill = el.getAttribute('fill');
            const stroke = el.getAttribute('stroke');

            // Apply fill if not explicitly none
            if (fill !== 'none') {
                el.style.fill = 'currentColor';
            }

            // Apply stroke if specified
            if (stroke && stroke !== 'none') {
                el.style.stroke = 'currentColor';
            }
        });
    });

    // Apply BG
    const previewBg = bgEnabled ? bgColor : 'transparent';
    grid.querySelectorAll('.icon-item').forEach(item => {
        item.style.backgroundColor = previewBg;
        if (bgEnabled) {
            item.style.borderColor = 'transparent';
        } else {
            item.style.borderColor = '';
        }
    });
}

async function insertIcon(element) {
    const name = element.dataset.name;
    if (!name) return;

    element.classList.add('inserting');

    try {
        let svgContent;
        const hasCdn = !!currentManifest.cdnPattern;

        if (hasCdn) {
            // Fetch from CDN
            const url = getIconUrl(currentManifest, name);
            if (iconCache.has(url)) {
                svgContent = iconCache.get(url);
            } else {
                const response = await fetch(url);
                if (!response.ok) throw new Error('Failed to fetch icon');
                svgContent = await response.text();
                iconCache.set(url, svgContent);
            }
        } else {
            // Use embedded SVG from manifest
            const icon = currentManifest.icons.find(i => i.name === name);
            if (!icon) throw new Error('Icon not found');

            if (typeof icon.svg === 'string') {
                svgContent = icon.svg;
            } else if (icon.svg && icon.svg.content) {
                svgContent = `<svg viewBox="${icon.svg.viewBox || '0 0 24 24'}" xmlns="http://www.w3.org/2000/svg">${icon.svg.content}</svg>`;
            } else {
                throw new Error('No SVG content available');
            }
        }

        // Convert to Base64 PNG
        const base64 = await svgToBase64PNG(svgContent, iconSize, iconColor, bgEnabled ? bgColor : null);

        await insertImageAsync(base64);
        showToast('Inserted!', 'success');
    } catch (error) {
        console.error('Insert failed:', error);
        showToast('Insert failed', 'error');
    } finally {
        element.classList.remove('inserting');
    }
}

function svgToBase64PNG(svgContent, size, color, backgroundColor) {
    return new Promise((resolve, reject) => {
        let coloredSvg = svgContent.replace(/currentColor/g, color);

        // Risky replacement for hardcoded fills if applyStylesToGrid logic worked visually but inconsistent here
        // We rely on 'currentColor' mostly.

        // Dimensions
        coloredSvg = coloredSvg.replace(/width="[^"]*"/, `width="${size}"`).replace(/height="[^"]*"/, `height="${size}"`);
        if (!coloredSvg.includes('width=')) {
            coloredSvg = coloredSvg.replace('<svg', `<svg width="${size}" height="${size}"`);
        }

        const canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');

        if (backgroundColor) {
            ctx.fillStyle = backgroundColor;
            ctx.fillRect(0, 0, size, size);
        }

        const img = new Image();
        const blob = new Blob([coloredSvg], { type: 'image/svg+xml;charset=utf-8' });
        const url = URL.createObjectURL(blob);

        img.onload = () => {
            ctx.drawImage(img, 0, 0, size, size);
            URL.revokeObjectURL(url);
            resolve(canvas.toDataURL('image/png').split(',')[1]);
        };

        img.onerror = reject;
        img.src = url;
    });
}

function insertImageAsync(base64) {
    return new Promise((resolve, reject) => {
        if (!Office.context || !Office.context.document) {
            console.log('Browser mode: Image generated');
            resolve();
            return;
        }

        Office.context.document.setSelectedDataAsync(
            base64,
            {
                coercionType: Office.CoercionType.Image,
                imageLeft: 100, imageTop: 100,
                imageWidth: iconSize, imageHeight: iconSize
            },
            (res) => {
                if (res.status === Office.AsyncResultStatus.Succeeded) resolve();
                else reject(new Error(res.error.message));
            }
        );
    });
}

function showLoading(show) {
    const loader = document.querySelector('.loading-state');
    const grid = document.getElementById('iconsGrid');

    if (show) {
        loader.classList.remove('hidden');
        grid.style.opacity = '0.5';
    } else {
        loader.classList.add('hidden');
        grid.style.opacity = '1';
    }
}

function showToast(msg, type) {
    const toast = document.getElementById('toast');
    toast.textContent = msg;
    toast.className = `toast visible ${type}`;
    setTimeout(() => toast.classList.remove('visible'), 2000);
}

// Global cache
const iconCache = new Map();
