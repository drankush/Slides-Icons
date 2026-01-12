/**
 * Build script for Slides Icons PowerPoint Add-in
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

console.log('Building Slides Icons add-in...\n');

// Copy taskpane files
function copyTaskpane() {
    console.log('Copying taskpane files...');

    const files = ['taskpane.html', 'taskpane.css', 'taskpane.js'];
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

    const srcDir = path.join(SRC_DIR, 'manifests');
    const destDir = path.join(DIST_DIR, 'manifests');

    if (!fs.existsSync(srcDir)) {
        console.log('  ⚠ No manifests directory found');
        return;
    }

    fs.mkdirSync(destDir, { recursive: true });

    const files = fs.readdirSync(srcDir).filter(f => f.endsWith('.json'));
    files.forEach(file => {
        fs.copyFileSync(path.join(srcDir, file), path.join(destDir, file));
    });

    console.log(`  ✓ Copied ${files.length} manifest files\n`);
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

// Copy production manifest (for GitHub Pages deployment)
function copyProdManifest() {
    console.log('Copying production manifest...');

    const srcPath = path.join(__dirname, '..', 'manifest-prod.xml');
    const destPath = path.join(DIST_DIR, 'manifest.xml');

    if (fs.existsSync(srcPath)) {
        fs.copyFileSync(srcPath, destPath);
        console.log('  ✓ Copied manifest-prod.xml → dist/manifest.xml\n');
    } else {
        console.log('  ⚠ manifest-prod.xml not found, skipping\n');
    }
}

// Main build
try {
    copyTaskpane();
    copyManifests();
    copyAssets();
    copyProdManifest();

    console.log('✅ Build complete! Output in dist/\n');
    console.log('To run the add-in:');
    console.log('  1. npm run generate-certs  (first time only)');
    console.log('  2. npm start');
    console.log('  3. Sideload manifest.xml in PowerPoint\n');
} catch (error) {
    console.error('❌ Build failed:', error);
    process.exit(1);
}
