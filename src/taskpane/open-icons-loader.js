/**
 * Open Icons Loader
 * Loads and decompresses icon packages from open-icons library
 */

// Import the decompress function from open-icons
const { decompress } = require('open-icons');

// Icon packages metadata (name, source, count)
const PACKAGES = [
    { id: 'awesome', name: 'Font Awesome', count: 1392 },
    { id: 'bootstrap', name: 'Bootstrap', count: 2050 },
    { id: 'box', name: 'Boxicons', count: 1634 },
    { id: 'carbon', name: 'Carbon', count: 2217 },
    { id: 'fluent', name: 'Fluent UI', count: 4978 },
    { id: 'hero', name: 'Heroicons', count: 592 },
    { id: 'ionicons', name: 'Ionicons', count: 934 },
    { id: 'lucide', name: 'Lucide', count: 1617 },
    { id: 'material', name: 'Material', count: 4227 },
    { id: 'mdi', name: 'MDI', count: 7447 },
    { id: 'feather', name: 'Feather', count: 287 },
    { id: 'tabler', name: 'Tabler', count: 4969 },
    { id: 'remix', name: 'Remix', count: 2860 },
    { id: 'phosphor', name: 'Phosphor', count: 7488 },
    { id: 'prime', name: 'Prime', count: 304 },
    { id: 'simple', name: 'Simple Icons', count: 3069 },
    { id: 'ant', name: 'Ant Design', count: 681 },
    { id: 'iconoir', name: 'Iconoir', count: 1370 },
    { id: 'octicons', name: 'Octicons', count: 584 },
    { id: 'radix', name: 'Radix', count: 322 },
];

// Cache for loaded packages
const loadedPackages = {};
const allIcons = [];
let allIconsLoaded = false;

/**
 * Load a specific icon package
 */
async function loadPackage(packageId) {
    if (loadedPackages[packageId]) {
        return loadedPackages[packageId];
    }

    try {
        const module = await import(`open-icons/dist/open-icons-${packageId}.js`);
        const data = JSON.parse(decompress(module.default));
        loadedPackages[packageId] = data;
        return data;
    } catch (error) {
        console.error(`Failed to load package ${packageId}:`, error);
        return null;
    }
}

/**
 * Get all available packages
 */
function getPackages() {
    return PACKAGES;
}

/**
 * Search icons across loaded packages
 */
function searchIcons(query, packageFilter = null) {
    const results = [];
    const q = query.toLowerCase();

    const packagesToSearch = packageFilter
        ? [packageFilter]
        : Object.keys(loadedPackages);

    for (const pkgId of packagesToSearch) {
        const pkg = loadedPackages[pkgId];
        if (!pkg || !pkg.icons) continue;

        for (const [name, svg] of Object.entries(pkg.icons)) {
            if (!query || name.toLowerCase().includes(q)) {
                results.push({
                    name,
                    svg,
                    package: pkgId,
                    packageName: pkg.name || pkgId
                });
            }

            // Limit results for performance
            if (results.length >= 500) break;
        }
        if (results.length >= 500) break;
    }

    return results;
}

// Export for use in taskpane
window.OpenIconsLoader = {
    loadPackage,
    getPackages,
    searchIcons,
    loadedPackages
};
