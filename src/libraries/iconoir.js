/**
 * Iconoir Provider
 * CDN-based icons - 1,600+ minimal SVG icons
 * License: MIT
 */

const CDN_BASE = 'https://cdn.jsdelivr.net/gh/iconoir-icons/iconoir@main/icons/';

export default {
    id: 'iconoir',
    name: 'Iconoir',
    description: '1,600+ minimal SVG icons',
    website: 'https://iconoir.com',
    license: 'MIT',
    iconCount: 1600,
    isLocal: false,

    // Single style library
    styles: [
        { id: 'regular', name: 'Regular' }
    ],
    defaultStyle: 'regular',

    // Manifest location
    manifestUrl: 'manifests/iconoir.json',

    // Get icon URL from CDN
    getIconUrl(iconName, style = 'regular', category = '') {
        // Iconoir uses flat structure with kebab-case naming
        return `${CDN_BASE}${iconName}.svg`;
    }
};
