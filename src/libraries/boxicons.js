/**
 * Boxicons Provider
 * CDN-based icons - 1,500+ carefully crafted icons
 * License: MIT
 */

const CDN_BASE = 'https://cdn.jsdelivr.net/npm/boxicons@2.1.4/svg/';

export default {
    id: 'boxicons',
    name: 'Boxicons',
    description: '1,500+ carefully designed icons',
    website: 'https://boxicons.com',
    license: 'MIT',
    iconCount: 1500,
    isLocal: false,

    // Three styles: regular, solid, logos
    styles: [
        { id: 'regular', name: 'Regular' },
        { id: 'solid', name: 'Solid' },
        { id: 'logos', name: 'Logos' }
    ],
    defaultStyle: 'regular',

    // Manifest location
    manifestUrl: 'manifests/boxicons.json',

    // Get icon URL from CDN
    // Boxicons structure: /svg/{style}/bx-{icon-name}.svg or bxs- for solid, bxl- for logos
    getIconUrl(iconName, style = 'regular', category = '') {
        const prefix = style === 'solid' ? 'bxs' : style === 'logos' ? 'bxl' : 'bx';
        return `${CDN_BASE}${style}/${prefix}-${iconName}.svg`;
    }
};
