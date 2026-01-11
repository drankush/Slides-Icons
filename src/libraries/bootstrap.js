/**
 * Bootstrap Icons Provider
 * CDN-based icons - 2,000+ official Bootstrap icons
 * License: MIT
 */

const CDN_BASE = 'https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/icons/';

export default {
    id: 'bootstrap',
    name: 'Bootstrap Icons',
    description: '2,000+ official Bootstrap icons',
    website: 'https://icons.getbootstrap.com',
    license: 'MIT',
    iconCount: 2000,
    isLocal: false,

    // Single style (some icons have -fill variants in their names)
    styles: [
        { id: 'regular', name: 'Regular' }
    ],
    defaultStyle: 'regular',

    // Manifest location
    manifestUrl: 'manifests/bootstrap.json',

    // Get icon URL from CDN
    // Bootstrap uses flat structure: /icons/{icon-name}.svg
    getIconUrl(iconName, style = 'regular', category = '') {
        return `${CDN_BASE}${iconName}.svg`;
    }
};
