/**
 * Build script for Health Icons PowerPoint Add-in
 * Generates icon manifest and copies files to dist folder
 */

const fs = require('fs');
const path = require('path');

const SRC_DIR = path.join(__dirname, '..', 'src');
const DIST_DIR = path.join(__dirname, '..', 'dist');
const META_DATA_PATH = '/tmp/healthicons_extracted/icons/meta-data.json';

// Clean and create dist directory
if (fs.existsSync(DIST_DIR)) {
    fs.rmSync(DIST_DIR, { recursive: true });
}
fs.mkdirSync(DIST_DIR, { recursive: true });

console.log('Building Health Icons add-in...\n');

// Generate icon manifest from meta-data
function generateManifest() {
    console.log('Generating icon manifest...');

    const metaData = JSON.parse(fs.readFileSync(META_DATA_PATH, 'utf8'));

    // Group icons by category
    const iconsByCategory = {};

    metaData.forEach(icon => {
        const category = icon.category;
        if (!iconsByCategory[category]) {
            iconsByCategory[category] = [];
        }
        iconsByCategory[category].push({
            name: icon.id,
            title: icon.title,
            keywords: icon.tags || []
        });
    });

    // Sort categories alphabetically
    const sortedCategories = {};
    Object.keys(iconsByCategory).sort().forEach(cat => {
        sortedCategories[cat] = iconsByCategory[cat];
    });

    const manifest = {
        version: '1.0.0',
        generatedAt: new Date().toISOString(),
        totalIcons: metaData.length,
        icons: sortedCategories
    };

    // Write manifest to src (for reference) and dist
    const manifestPath = path.join(SRC_DIR, 'icons', 'manifest.json');
    fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));

    console.log(`  ✓ Generated manifest with ${metaData.length} icons in ${Object.keys(sortedCategories).length} categories\n`);

    return manifest;
}

// Copy taskpane files
function copyTaskpane() {
    console.log('Copying taskpane files...');

    const files = ['taskpane.html', 'taskpane.css', 'taskpane.js'];
    const srcDir = path.join(SRC_DIR, 'taskpane');

    files.forEach(file => {
        const srcPath = path.join(srcDir, file);
        const destPath = path.join(DIST_DIR, file);
        fs.copyFileSync(srcPath, destPath);
        console.log(`  ✓ Copied ${file}`);
    });
    console.log('');
}

// Copy icons
function copyIcons() {
    console.log('Copying icons...');

    const iconsSrcDir = path.join(SRC_DIR, 'icons');
    const iconsDestDir = path.join(DIST_DIR, 'icons');

    fs.mkdirSync(iconsDestDir, { recursive: true });

    // Copy manifest
    fs.copyFileSync(
        path.join(iconsSrcDir, 'manifest.json'),
        path.join(iconsDestDir, 'manifest.json')
    );

    // Copy icon directories (filled and outline)
    ['filled', 'outline'].forEach(style => {
        const styleSrcDir = path.join(iconsSrcDir, style);
        const styleDestDir = path.join(iconsDestDir, style);

        if (fs.existsSync(styleSrcDir)) {
            copyDirRecursive(styleSrcDir, styleDestDir);
        }
    });

    console.log('  ✓ Copied all icon files\n');
}

// Copy assets
function copyAssets() {
    console.log('Copying assets...');

    const assetsSrcDir = path.join(SRC_DIR, '..', 'assets');
    const assetsDestDir = path.join(DIST_DIR, 'assets');

    if (fs.existsSync(assetsSrcDir)) {
        copyDirRecursive(assetsSrcDir, assetsDestDir);
        console.log('  ✓ Copied assets\n');
    } else {
        fs.mkdirSync(assetsDestDir, { recursive: true });
        console.log('  ⚠ No assets directory found, created empty one\n');
    }
}

// Recursive directory copy
function copyDirRecursive(src, dest) {
    fs.mkdirSync(dest, { recursive: true });

    const entries = fs.readdirSync(src, { withFileTypes: true });

    for (const entry of entries) {
        const srcPath = path.join(src, entry.name);
        const destPath = path.join(dest, entry.name);

        if (entry.isDirectory()) {
            copyDirRecursive(srcPath, destPath);
        } else {
            fs.copyFileSync(srcPath, destPath);
        }
    }
}

// Main build
try {
    generateManifest();
    copyTaskpane();
    copyIcons();
    copyAssets();

    console.log('✅ Build complete! Output in dist/\n');
    console.log('To run the add-in:');
    console.log('  1. npm run generate-certs  (first time only)');
    console.log('  2. npm start');
    console.log('  3. Sideload manifest.xml in PowerPoint\n');
} catch (error) {
    console.error('❌ Build failed:', error);
    process.exit(1);
}
