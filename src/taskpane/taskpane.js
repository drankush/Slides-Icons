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
let displayLimit = 100; // Icons shown at a time
let isGlobalSearch = false;
let globalManifests = new Map(); // Cache for global search

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
        searchInput.timeout = setTimeout(() => {
            if (isGlobalSearch) {
                searchAllLibraries();
            } else {
                renderIcons();
            }
        }, 250);
    });

    // Global Search Toggle
    const globalToggle = document.getElementById('globalSearchToggle');
    if (globalToggle) {
        globalToggle.addEventListener('change', (e) => {
            isGlobalSearch = e.target.checked;
            const searchVal = searchInput.value.trim();

            if (isGlobalSearch && searchVal) {
                // Trigger global search immediately if there's a query
                searchAllLibraries();
            } else if (!isGlobalSearch) {
                // Revert to local search
                renderIcons();
            }
        });
    }

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
        // Show total library count in sidebar header
        document.getElementById('totalCount').textContent = allLibraries.length;
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
        }
        // Reset display limit when switching libraries
        displayLimit = 100;

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
        icons = icons.filter(i =>
            i.name.toLowerCase().includes(searchVal) ||
            (i.title && i.title.toLowerCase().includes(searchVal)) ||
            (i.tags && i.tags.some(tag => tag.toLowerCase().includes(searchVal))) ||
            (i.category && i.category.toLowerCase().includes(searchVal))
        );
        // Reset display limit when searching
        displayLimit = 100;
    }

    // Count valid icons (with actual content)
    // CDN-based manifests: all icons are valid (fetched from CDN)
    // Embedded SVG manifests: check for valid svg content
    const hasCdn = !!currentManifest.cdnPattern;
    const validIcons = hasCdn ? icons : icons.filter(icon => {
        if (typeof icon.svg === 'string') return true;
        if (icon.svg && typeof icon.svg.content === 'string') return true;
        return false;
    });

    const footer = document.getElementById('iconCount');
    const remaining = validIcons.length - displayLimit;
    if (validIcons.length > 0) {
        if (validIcons.length > displayLimit) {
            footer.textContent = `Showing ${displayLimit} of ${validIcons.length} icons`;
        } else {
            footer.textContent = `${validIcons.length} icons`;
        }
    } else {
        footer.textContent = '0 icons';
    }

    const displayIcons = icons.slice(0, displayLimit);

    if (displayIcons.length === 0) {
        grid.innerHTML = '<div class="empty-state">No icons found</div>';
        return;
    }

    // hasCdn already declared above

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

    // Add Load More button if there are more icons
    if (validIcons.length > displayLimit) {
        grid.innerHTML += `
            <div class="load-more-container">
                <button id="loadMoreBtn" class="load-more-btn">
                    Load 50 more (${remaining} remaining)
                </button>
            </div>
        `;
        // Add event listener for Load More
        document.getElementById('loadMoreBtn').addEventListener('click', () => {
            displayLimit += 50;
            renderIcons();
        });
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

async function insertIcon(element, libraryIdOverride = null) {
    const name = element.dataset.name;
    if (!name) return;

    element.classList.add('inserting');

    try {
        let svgContent;
        // Determine which manifest to use
        const manifestToUse = libraryIdOverride ? globalManifests.get(libraryIdOverride) : currentManifest;

        if (!manifestToUse) throw new Error("Manifest not found for insertion");

        const hasCdn = !!manifestToUse.cdnPattern;

        if (hasCdn) {
            // Fetch from CDN
            const url = getIconUrl(manifestToUse, name);
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
            const icon = manifestToUse.icons.find(i => i.name === name);
            if (!icon) throw new Error('Icon not found');

            // ... existing svg extraction ...
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

/**
 * Global Search Implementation
 */
async function searchAllLibraries() {
    const searchVal = document.getElementById('searchInput').value.toLowerCase();
    const grid = document.getElementById('iconsGrid');
    const footer = document.getElementById('iconCount');
    const loadMoreContainer = document.querySelector('.load-more-container');

    // Hide load more button during search
    if (loadMoreContainer) loadMoreContainer.style.display = 'none';

    if (!searchVal) {
        // If query is empty, just render current library or nothing
        renderIcons();
        return;
    }

    showLoading(true);
    document.getElementById('currentLibrary').textContent = "Global Search";

    try {
        // 1. Ensure all manifests are loaded
        await loadAllManifests();

        // 2. Aggregate results
        let allResults = [];
        globalManifests.forEach(manifest => {
            if (!manifest || !Array.isArray(manifest.icons)) return;
            const matches = manifest.icons.filter(i =>
                i.name.toLowerCase().includes(searchVal) ||
                (i.title && i.title.toLowerCase().includes(searchVal)) ||
                (i.tags && i.tags.some(tag => tag.toLowerCase().includes(searchVal))) ||
                (i.category && i.category.toLowerCase().includes(searchVal))
            );

            // Add library info to icons for context
            matches.forEach(m => {
                m._libraryId = manifest.id;
                m._libraryName = manifest.name;
            });

            allResults = allResults.concat(matches);
        });

        // 3. Render Mixed Results
        const validIcons = allResults; // In global search we assume all loaded are valid enough

        if (validIcons.length > 0) {
            footer.textContent = `Found ${validIcons.length} icons in ${allLibraries.length} libraries`;
        } else {
            footer.textContent = '0 icons';
        }

        // Limit display for performance in global view (e.g. top 200)
        // For now, let's show top 200 to prevent freezing
        const displayIcons = validIcons.slice(0, 200);

        if (displayIcons.length === 0) {
            grid.innerHTML = '<div class="empty-state">No icons found</div>';
        } else {
            grid.innerHTML = displayIcons.map(icon => {
                // We need to handle rendering slightly differently because we stick to the 
                // robust rendering logic but we need the correct manifest context for each icon
                // to determine CDN vs SVG.
                const sourceManifest = globalManifests.get(icon._libraryId);
                const hasCdn = !!sourceManifest.cdnPattern;

                if (hasCdn) {
                    const url = getIconUrl(sourceManifest, icon.name);
                    return `
                        <div class="icon-item" data-name="${icon.name}" data-library="${icon._libraryId}" title="${icon.title} (${sourceManifest.name})">
                            <div class="icon-preview">
                                <img src="${url}" alt="${icon.title}" loading="lazy" class="icon-img-shadowed">
                            </div>
                        </div>
                    `;
                } else {
                    let svgHtml = '';
                    if (typeof icon.svg === 'string') {
                        svgHtml = icon.svg;
                    } else if (icon.svg && typeof icon.svg.content === 'string') {
                        svgHtml = `<svg viewBox="${icon.svg.viewBox || '0 0 24 24'}" xmlns="http://www.w3.org/2000/svg">${icon.svg.content}</svg>`;
                    }
                    if (!svgHtml) return '';
                    return `
                        <div class="icon-item" data-name="${icon.name}" data-library="${icon._libraryId}" title="${icon.title} (${sourceManifest.name})">
                            <div class="icon-preview">
                                ${svgHtml}
                            </div>
                        </div>
                    `;
                }
            }).join('');

            // Add click listeners
            grid.querySelectorAll('.icon-item').forEach(item => {
                item.addEventListener('click', () => {
                    // Update currentManifest to the icon's library so insertKey logic works
                    // OR pass the library ID to insertIcon?
                    // Let's modify insertIcon to accept libraryId optionally
                    insertIcon(item, item.dataset.library);
                });
            });

            applyStylesToGrid();
        }

    } catch (error) {
        console.error("Global search failed:", error);
        showToast("Global search error", "error");
    } finally {
        showLoading(false);
    }
}

async function loadAllManifests() {
    // Check which ones are missing
    const missing = allLibraries.filter(lib => !globalManifests.has(lib.id));

    if (missing.length === 0) return;

    // Fetch in batches to be nice
    const BATCH_SIZE = 10;
    for (let i = 0; i < missing.length; i += BATCH_SIZE) {
        const batch = missing.slice(i, i + BATCH_SIZE);
        await Promise.all(batch.map(async (lib) => {
            try {
                const response = await fetch(`manifests/${lib.id}.json`);
                if (response.ok) {
                    const data = await response.json();
                    globalManifests.set(lib.id, data);
                }
            } catch (e) {
                console.warn(`Failed to preload ${lib.id}`, e);
            }
        }));
    }
}
