/**
 * Library Registry - Central hub for all icon library providers
 */

import healthicons from './healthicons.js';
import iconoir from './iconoir.js';
import remixicon from './remixicon.js';
import bootstrap from './bootstrap.js';
import ionicons from './ionicons.js';
import boxicons from './boxicons.js';

// All available icon libraries
export const libraries = {
    healthicons,
    iconoir,
    remixicon,
    bootstrap,
    ionicons,
    boxicons
};

// Get library by ID
export function getLibrary(id) {
    return libraries[id] || null;
}

// Get all library options for dropdown
export function getLibraryOptions() {
    return Object.values(libraries).map(lib => ({
        id: lib.id,
        name: lib.name,
        description: lib.description,
        iconCount: lib.iconCount
    }));
}

// Load manifest for a library
export async function loadLibraryManifest(libraryId) {
    const library = getLibrary(libraryId);
    if (!library) {
        throw new Error(`Unknown library: ${libraryId}`);
    }

    try {
        const response = await fetch(library.manifestUrl);
        if (!response.ok) {
            throw new Error(`Failed to load manifest: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error(`Failed to load manifest for ${libraryId}:`, error);
        throw error;
    }
}

// Fetch icon SVG content (handles both local and CDN)
export async function fetchIconSvg(libraryId, iconName, style, category) {
    const library = getLibrary(libraryId);
    if (!library) {
        throw new Error(`Unknown library: ${libraryId}`);
    }

    const url = library.getIconUrl(iconName, style, category);

    // Check cache first
    const cacheKey = `icon_${libraryId}_${style}_${iconName}`;
    const cached = sessionStorage.getItem(cacheKey);
    if (cached) {
        return cached;
    }

    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`Failed to fetch icon: ${response.status}`);
    }

    const svg = await response.text();

    // Cache the result
    try {
        sessionStorage.setItem(cacheKey, svg);
    } catch (e) {
        // Storage might be full, ignore
    }

    return svg;
}

export default libraries;
