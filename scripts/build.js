/**
 * Build script for OpenIcons PowerPoint Add-in
 * Copies files and manifests to dist folder
 */

const fs = require('fs');
const path = require('path');

const SRC_DIR = path.join(__dirname, '..', 'src');
const DIST_DIR = path.join(__dirname, '..', 'dist');

// Clean and create dist directory
if (fs.existsSync(DIST_DIR)) {
    fs.rmSync(DIST_DIR, { recursive: true });
}
fs.mkdirSync(DIST_DIR, { recursive: true });

console.log('Building OpenIcons add-in...\n');

// Copy taskpane files
function copyTaskpane() {
    console.log('Copying taskpane files...');

    const files = ['taskpane.html', 'taskpane.css', 'taskpane.js', 'libraries.js'];
    const srcDir = path.join(SRC_DIR, 'taskpane');

    files.forEach(file => {
        const srcPath = path.join(srcDir, file);
        if (fs.existsSync(srcPath)) {
            const destPath = path.join(DIST_DIR, file);
            fs.copyFileSync(srcPath, destPath);
            console.log(`  ✓ Copied ${file}`);
        }
    });
    console.log('');
}

// Copy manifests
function copyManifests() {
    console.log('Copying manifests...');

    const manifestsSrcDir = path.join(SRC_DIR, 'manifests');
    const manifestsDestDir = path.join(DIST_DIR, 'manifests');

    if (fs.existsSync(manifestsSrcDir)) {
        copyDirRecursive(manifestsSrcDir, manifestsDestDir);
        const files = fs.readdirSync(manifestsSrcDir);
        console.log(`  ✓ Copied ${files.length} manifest files`);
    } else {
        fs.mkdirSync(manifestsDestDir, { recursive: true });
        console.log('  ⚠ No manifests directory found');
    }
    console.log('');
}

// Copy health icons (local bundle)
function copyIcons() {
    console.log('Copying Health Icons (local bundle)...');

    const iconsSrcDir = path.join(SRC_DIR, 'icons');
    const iconsDestDir = path.join(DIST_DIR, 'icons');

    if (!fs.existsSync(iconsSrcDir)) {
        console.log('  ⚠ No icons directory found\n');
        return;
    }

    fs.mkdirSync(iconsDestDir, { recursive: true });

    // Copy icon directories (filled and outline)
    let iconCount = 0;
    ['filled', 'outline'].forEach(style => {
        const styleSrcDir = path.join(iconsSrcDir, style);
        const styleDestDir = path.join(iconsDestDir, style);

        if (fs.existsSync(styleSrcDir)) {
            copyDirRecursive(styleSrcDir, styleDestDir);
            iconCount += countFiles(styleSrcDir);
        }
    });

    console.log(`  ✓ Copied ${iconCount} icon files\n`);
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

// Count files in directory recursively
function countFiles(dir) {
    let count = 0;
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
        if (entry.isDirectory()) {
            count += countFiles(path.join(dir, entry.name));
        } else {
            count++;
        }
    }
    return count;
}

// Main build
try {
    copyTaskpane();
    copyManifests();
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
