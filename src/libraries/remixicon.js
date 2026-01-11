/**
 * Remix Icon Provider
 * CDN-based icons - 3,100+ neutral style system symbols
 * License: Apache 2.0
 */

const CDN_BASE = 'https://cdn.jsdelivr.net/npm/remixicon@4.5.0/icons/';

export default {
    id: 'remixicon',
    name: 'Remix Icon',
    description: '3,100+ neutral style icons',
    website: 'https://remixicon.com',
    license: 'Apache 2.0',
    iconCount: 3100,
    isLocal: false,

    // Two styles: line and fill
    styles: [
        { id: 'line', name: 'Line' },
        { id: 'fill', name: 'Fill' }
    ],
    defaultStyle: 'line',

    // Manifest location
    manifestUrl: 'manifests/remixicon.json',

    // Get icon URL from CDN
    // Remix Icon structure: /icons/{category}/{icon-name}.svg
    getIconUrl(iconName, style = 'line', category = '') {
        // Remix icons include style in the name: icon-name-line.svg or icon-name-fill.svg
        return `${CDN_BASE}${category}/${iconName}-${style}.svg`;
    }
};
