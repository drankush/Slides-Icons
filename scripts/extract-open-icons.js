/**
 * Extract OpenIcons data to static JSON files
 * Uses JSDOM to run the library's native decompress function
 */

const fs = require('fs');
const path = require('path');
const jsdom = require("jsdom");
const { JSDOM } = jsdom;

const DIST_DIR = path.join(__dirname, '..', 'src', 'manifests');
const OPEN_ICONS_DIR = path.join(__dirname, '..', 'node_modules', 'open-icons', 'dist');

if (!fs.existsSync(DIST_DIR)) {
    fs.mkdirSync(DIST_DIR, { recursive: true });
}

// Initialize JSDOM
const dom = new JSDOM(`<!DOCTYPE html><p>OpenIcons Extractor</p>`, {
    runScripts: "dangerously",
    resources: "usable"
});
const { window } = dom;

// Polyfill globals and fake module system
global.window = window;
global.document = window.document;
global.self = window;
global.navigator = window.navigator;

window.module = { exports: {} };
window.exports = window.module.exports;

// Load OpenIcons main bundle
const mainBundlePath = path.join(OPEN_ICONS_DIR, 'open-icons.js');
const mainBundleCode = fs.readFileSync(mainBundlePath, 'utf8');

try {
    window.eval(mainBundleCode);
    console.log('✅ OpenIcons library loaded');
} catch (e) {
    console.error('Failed to load OpenIcons library:', e);
    process.exit(1);
}

const decompress = window.module.exports.decompress;
if (!decompress) {
    console.error('❌ decompress function not found in exports');
    process.exit(1);
}

// Function to extract and decompress a package
function processPackage(filename) {
    if (!filename.startsWith('open-icons-') || filename === 'open-icons.js') return;

    const id = filename.replace('open-icons-', '').replace('.js', '');
    const filePath = path.join(OPEN_ICONS_DIR, filename);

    console.log(`Processing ${id}...`);

    try {
        const content = fs.readFileSync(filePath, 'utf8');

        // Extract compressed string
        // Matches return"STRING";return
        // or just a long quoted string
        const match = content.match(/"([^"]{1000,})"/);

        if (!match) {
            console.log(`  ⚠ No compressed data found in ${filename}`);
            return;
        }

        const compressed = match[1];
        const decompressed = decompress(compressed);

        if (!decompressed) throw new Error('Decompression returned null');

        const data = JSON.parse(decompressed);

        // Transform to manifest format with SVGs
        const icons = Object.keys(data.icons || {}).map(name => ({
            name: name,
            title: name.replace(/[-_]/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
            svg: data.icons[name] // The raw SVG path/element
        }));

        const manifest = {
            id: id,
            name: data.name || id,
            version: data.version || '1.0.0',
            totalIcons: icons.length,
            icons: icons,
            attributes: data.attributes || {}
        };

        fs.writeFileSync(path.join(DIST_DIR, `${id}.json`), JSON.stringify(manifest));
        console.log(`  ✓ Saved ${id}.json (${icons.length} icons)`);

    } catch (error) {
        console.log(`  ⚠ Error ${id}: ${error.message}`);
    }
}

// Main
console.log('📦 Extracting icons...');
const files = fs.readdirSync(OPEN_ICONS_DIR);

let count = 0;
for (const file of files) {
    if (file.endsWith('.js')) {
        processPackage(file);
        count++;
    }
}

console.log(`\n✅ Extracted ${count} libraries to ${DIST_DIR}`);
