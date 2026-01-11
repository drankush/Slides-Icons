/**
 * OpenIcons Library Registry
 * Bundled version for browser (no ES modules)
 */

const OpenIconsLibraries = {
    healthicons: {
        id: 'healthicons',
        name: 'Health Icons',
        description: '740+ medical & health icons',
        website: 'https://healthicons.org',
        license: 'CC0',
        iconCount: 740,
        isLocal: true,
        styles: [
            { id: 'filled', name: 'Filled' },
            { id: 'outline', name: 'Outline' }
        ],
        defaultStyle: 'filled',
        manifestUrl: 'manifests/healthicons.json',
        getIconUrl(iconName, style, category) {
            return `icons/${style}/${category}/${iconName}.svg`;
        }
    },

    bootstrap: {
        id: 'bootstrap',
        name: 'Bootstrap Icons',
        description: '2,000+ official Bootstrap icons',
        website: 'https://icons.getbootstrap.com',
        license: 'MIT',
        iconCount: 2000,
        isLocal: false,
        styles: [
            { id: 'regular', name: 'Regular' }
        ],
        defaultStyle: 'regular',
        manifestUrl: 'manifests/bootstrap.json',
        getIconUrl(iconName, style, category) {
            return `https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/icons/${iconName}.svg`;
        }
    },

    ionicons: {
        id: 'ionicons',
        name: 'Ionicons',
        description: '1,300+ premium open source icons',
        website: 'https://ionic.io/ionicons',
        license: 'MIT',
        iconCount: 1300,
        isLocal: false,
        styles: [
            { id: 'outline', name: 'Outline' },
            { id: 'filled', name: 'Filled' },
            { id: 'sharp', name: 'Sharp' }
        ],
        defaultStyle: 'outline',
        manifestUrl: 'manifests/ionicons.json',
        getIconUrl(iconName, style, category) {
            if (style === 'filled') {
                return `https://cdn.jsdelivr.net/npm/ionicons@7.4.0/dist/svg/${iconName}.svg`;
            }
            return `https://cdn.jsdelivr.net/npm/ionicons@7.4.0/dist/svg/${iconName}-${style}.svg`;
        }
    },

    remixicon: {
        id: 'remixicon',
        name: 'Remix Icon',
        description: '3,100+ neutral style icons',
        website: 'https://remixicon.com',
        license: 'Apache 2.0',
        iconCount: 3100,
        isLocal: false,
        styles: [
            { id: 'line', name: 'Line' },
            { id: 'fill', name: 'Fill' }
        ],
        defaultStyle: 'line',
        manifestUrl: 'manifests/remixicon.json',
        getIconUrl(iconName, style, category) {
            return `https://cdn.jsdelivr.net/npm/remixicon@4.5.0/icons/${category}/${iconName}-${style}.svg`;
        }
    },

    iconoir: {
        id: 'iconoir',
        name: 'Iconoir',
        description: '1,600+ minimal SVG icons',
        website: 'https://iconoir.com',
        license: 'MIT',
        iconCount: 1600,
        isLocal: false,
        styles: [
            { id: 'regular', name: 'Regular' },
            { id: 'solid', name: 'Solid' }
        ],
        defaultStyle: 'regular',
        manifestUrl: 'manifests/iconoir.json',
        getIconUrl(iconName, style, category) {
            return `https://cdn.jsdelivr.net/gh/iconoir-icons/iconoir@main/icons/${style}/${iconName}.svg`;
        }
    },

    boxicons: {
        id: 'boxicons',
        name: 'Boxicons',
        description: '1,500+ carefully designed icons',
        website: 'https://boxicons.com',
        license: 'MIT',
        iconCount: 1500,
        isLocal: false,
        styles: [
            { id: 'regular', name: 'Regular' },
            { id: 'solid', name: 'Solid' },
            { id: 'logos', name: 'Logos' }
        ],
        defaultStyle: 'regular',
        manifestUrl: 'manifests/boxicons.json',
        getIconUrl(iconName, style, category) {
            const prefix = style === 'solid' ? 'bxs' : style === 'logos' ? 'bxl' : 'bx';
            return `https://cdn.jsdelivr.net/npm/boxicons@2.1.4/svg/${style}/${prefix}-${iconName}.svg`;
        }
    }
};

// Helper functions
function getLibrary(id) {
    return OpenIconsLibraries[id] || null;
}

function getLibraryOptions() {
    return Object.values(OpenIconsLibraries).map(lib => ({
        id: lib.id,
        name: lib.name,
        description: lib.description,
        iconCount: lib.iconCount,
        license: lib.license,
        website: lib.website
    }));
}

// SVG cache
const svgCache = {};

async function fetchIconSvg(libraryId, iconName, style, category) {
    const library = getLibrary(libraryId);
    if (!library) throw new Error(`Unknown library: ${libraryId}`);

    const url = library.getIconUrl(iconName, style, category);
    const cacheKey = `${libraryId}_${style}_${category}_${iconName}`;

    // Check memory cache
    if (svgCache[cacheKey]) {
        return svgCache[cacheKey];
    }

    // Check session storage
    try {
        const cached = sessionStorage.getItem(cacheKey);
        if (cached) {
            svgCache[cacheKey] = cached;
            return cached;
        }
    } catch (e) { /* ignore */ }

    // Fetch from network
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Failed to fetch: ${response.status}`);

    const svg = await response.text();

    // Cache it
    svgCache[cacheKey] = svg;
    try {
        sessionStorage.setItem(cacheKey, svg);
    } catch (e) { /* storage full, ignore */ }

    return svg;
}
