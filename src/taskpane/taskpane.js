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
    searchInput.addEventListener('input', debounce(renderIcons, 200));

    // Size
    document.getElementById('sizeSelect').addEventListener('change', (e) => {
        iconSize = parseInt(e.target.value);
    });

    // Icon Color
    const colorPicker = document.getElementById('colorPicker');
    const colorValue = document.getElementById('colorValue');
    colorPicker.addEventListener('input', (e) => {
        iconColor = e.target.value;
        colorValue.textContent = iconColor;
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

        // precise initial load: Bootstrap or first available
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
    // Update active state in sidebar
    document.querySelectorAll('.library-item').forEach(el => {
        el.classList.toggle('active', el.dataset.id === id);
    });

    currentLibrary = id;
    showLoading(true);

    try {
        const response = await fetch(`manifests/${id}.json`);
        if (!response.ok) throw new Error(`Failed to load ${id}`);

        currentManifest = await response.json();

        // Update header info
        const libInfo = allLibraries.find(l => l.id === id);
        if (libInfo) {
            document.getElementById('currentLibrary').textContent = libInfo.name;
            document.getElementById('totalCount').textContent = currentManifest.totalIcons;
        }

        renderIcons(); // Initial render

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

    // Filter
    if (searchVal) {
        icons = icons.filter(i => i.name.toLowerCase().includes(searchVal) ||
            (i.title && i.title.toLowerCase().includes(searchVal)));
    }

    document.getElementById('iconCount').textContent = `${icons.length} icons`;

    // Performance limit
    const displayIcons = icons.slice(0, 300);

    if (displayIcons.length === 0) {
        grid.innerHTML = '<div class="empty-state">No icons found</div>';
        return;
    }

    grid.innerHTML = displayIcons.map(icon => {
        // SVG content is in icon.svg (if from our extractor)
        // Format: { name, viewBox, content } OR string
        let svgHtml = '';

        if (typeof icon.svg === 'string') {
            svgHtml = icon.svg; // Full SVG string
        } else if (icon.svg && icon.svg.content) {
            // Construct SVG
            svgHtml = `<svg viewBox="${icon.svg.viewBox || '0 0 24 24'}" xmlns="http://www.w3.org/2000/svg">${icon.svg.content}</svg>`;
        }

        // Strip existing fill/stroke to allow coloring
        // We do this via CSS 'currentColor' mostly, but for PNG generation we parse it.
        // For grid display, we rely on CSS.

        return `
            <div class="icon-item" data-name="${icon.name}">
                <div class="icon-preview">
                    ${svgHtml}
                </div>
            </div>
        `;
    }).join('');

    if (icons.length > 300) {
        grid.innerHTML += `<div class="icon-limit-message">Showing 300 of ${icons.length}</div>`;
    }

    // Apply initial colors
    applyStylesToGrid();

    // Click listeners
    grid.querySelectorAll('.icon-item').forEach(item => {
        item.addEventListener('click', () => insertIcon(item));
    });
}

function applyStylesToGrid() {
    const grid = document.getElementById('iconsGrid');

    // Apply icon color
    grid.style.color = iconColor;
    grid.querySelectorAll('svg').forEach(svg => {
        svg.style.fill = 'currentColor';
    });

    // Apply BG color to previews
    const previewBg = bgEnabled ? bgColor : 'transparent';
    grid.querySelectorAll('.icon-item').forEach(item => {
        item.style.backgroundColor = previewBg;
        // If dark BG, add light border?
        if (bgEnabled) {
            item.style.borderColor = 'transparent';
        } else {
            item.style.borderColor = ''; // reset to CSS default
        }
    });
}

async function insertIcon(element) {
    const svgEl = element.querySelector('svg');
    if (!svgEl) return;

    element.classList.add('inserting');

    try {
        const svgString = new XMLSerializer().serializeToString(svgEl);
        const base64 = await svgToBase64PNG(svgString, iconSize, iconColor, bgEnabled ? bgColor : null);

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
        // Inject color
        let coloredSvg = svgContent.replace(/currentColor/g, color);

        // Force fill if not present (simple heuristic)
        if (!coloredSvg.includes('fill=')) {
            // This is risky, open-icons usually have fill/stroke. 
            // We trust existing attributes + currentColor replacement.
        }

        // Fix dimensions
        coloredSvg = coloredSvg.replace(/width="[^"]*"/, `width="${size}"`).replace(/height="[^"]*"/, `height="${size}"`);
        if (!coloredSvg.includes('width=')) {
            coloredSvg = coloredSvg.replace('<svg', `<svg width="${size}" height="${size}"`);
        }

        const canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');

        // Draw background
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
            console.log('Browser mode: Image generated (would insert)');
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
    const grid = document.getElementById('iconsGrid');
    if (show) grid.innerHTML = '<div class="loading-state"><div class="spinner"></div><p>Loading...</p></div>';
}

function showToast(msg, type) {
    const toast = document.getElementById('toast');
    toast.textContent = msg;
    toast.className = `toast visible ${type}`;
    setTimeout(() => toast.classList.remove('visible'), 2000);
}

function debounce(fn, ms) {
    let t;
    return (...args) => {
        clearTimeout(t);
        t = setTimeout(() => fn(...args), ms);
    }
}
