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

    // Two styles: regular and solid
    styles: [
        { id: 'regular', name: 'Regular' },
        { id: 'solid', name: 'Solid' }
    ],
    defaultStyle: 'regular',

    // Manifest location
    manifestUrl: 'manifests/iconoir.json',

    // Get icon URL from CDN - icons/{style}/{icon-name}.svg
    getIconUrl(iconName, style = 'regular', category = '') {
        return `${CDN_BASE}${style}/${iconName}.svg`;
    }
};
