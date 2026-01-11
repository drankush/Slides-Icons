/**
 * Ionicons Provider
 * CDN-based icons - 1,300+ premium icons for Ionic Framework
 * License: MIT
 */

const CDN_BASE = 'https://cdn.jsdelivr.net/npm/ionicons@7.4.0/dist/svg/';

export default {
    id: 'ionicons',
    name: 'Ionicons',
    description: '1,300+ premium open source icons',
    website: 'https://ionic.io/ionicons',
    license: 'MIT',
    iconCount: 1300,
    isLocal: false,

    // Three styles: outline, filled (sharp removed as it's less common)
    styles: [
        { id: 'outline', name: 'Outline' },
        { id: 'filled', name: 'Filled' },
        { id: 'sharp', name: 'Sharp' }
    ],
    defaultStyle: 'outline',

    // Manifest location
    manifestUrl: 'manifests/ionicons.json',

    // Get icon URL from CDN
    // Ionicons structure: {icon-name}-{style}.svg (e.g., heart-outline.svg)
    getIconUrl(iconName, style = 'outline', category = '') {
        // For filled style, just use the base name
        if (style === 'filled') {
            return `${CDN_BASE}${iconName}.svg`;
        }
        return `${CDN_BASE}${iconName}-${style}.svg`;
    }
};
