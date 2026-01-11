/**
 * Health Icons Provider
 * Local bundled icons - 740+ medical/health icons
 * License: CC0 (Public Domain)
 */

export default {
    id: 'healthicons',
    name: 'Health Icons',
    description: '740+ medical & health icons',
    website: 'https://healthicons.org',
    license: 'CC0',
    iconCount: 740,
    isLocal: true,

    // Available styles
    styles: [
        { id: 'filled', name: 'Filled' },
        { id: 'outline', name: 'Outline' }
    ],
    defaultStyle: 'filled',

    // Manifest location
    manifestUrl: 'manifests/healthicons.json',

    // Get icon URL (local path)
    getIconUrl(iconName, style = 'filled', category = '') {
        return `icons/${style}/${category}/${iconName}.svg`;
    }
};
