/**
 * Extract Health Icons data to static JSON files
 */

const fs = require('fs');
const path = require('path');

const DIST_DIR = path.join(__dirname, '..', 'src', 'manifests');
const HEALTH_ICONS_DIR = path.join(__dirname, '..', 'node_modules', 'healthicons', 'public', 'icons');
const OUTPUT_FILE = path.join(DIST_DIR, 'health.json');

if (!fs.existsSync(DIST_DIR)) {
    fs.mkdirSync(DIST_DIR, { recursive: true });
}

console.log('🏥 Extracting Health Icons...');

try {
    // 1. Load Metadata
    const metaPath = path.join(HEALTH_ICONS_DIR, 'meta-data.json');
    const metadata = JSON.parse(fs.readFileSync(metaPath, 'utf8'));

    console.log(`  Found ${metadata.length} icons in metadata`);

    const icons = [];
    let successCount = 0;
    let errorCount = 0;

    // 2. Process each icon
    for (const item of metadata) {
        // We use the 'outline' version by default as it matches other libraries effectively
        // item.path is like "vehicles/war"
        // The file is at .../icons/svg/outline/vehicles/war.svg

        const svgPath = path.join(HEALTH_ICONS_DIR, 'svg', 'outline', `${item.path}.svg`);

        try {
            if (!fs.existsSync(svgPath)) {
                // Try 24px version if standard not found? Or just skip.
                // Metadata defines formats: ["48px"] etc. But usually outline/path.svg exists.
                // Let's check availability.
                // console.warn(`  Missing SVG: ${item.path}`);
                continue;
            }

            let svgContent = fs.readFileSync(svgPath, 'utf8');

            // Cleanup SVG: remove xmlns, width, height to allow scaling
            // But we actually want the content mostly. 
            // The taskpane.js handles <svg> wrapper if we return content.
            // Or we can return the whole string.
            // Let's strip the <svg> tags to be consistent with other extractors if possible, 
            // OR just return the whole SVG string if it's clean enough.
            // The current generic renderer handles both raw string and {content, viewBox}.

            // Simple approach: standard cleaning
            // Remove xml decl
            svgContent = svgContent.replace(/<\?xml.*?\?>/g, '');
            // Remove comments
            svgContent = svgContent.replace(/<!--.*?-->/g, '');
            // Remove DOCTYPE
            svgContent = svgContent.replace(/<!DOCTYPE.*?>/g, '');

            icons.push({
                name: item.id,
                title: item.title,
                category: item.category, // Extra metadata useful for search
                tags: item.tags,         // Extra metadata useful for search
                svg: svgContent.trim()
            });

            successCount++;
        } catch (err) {
            console.error(`  Error processing ${item.id}:`, err.message);
            errorCount++;
        }
    }

    // 3. Create Manifest
    const manifest = {
        id: 'health',
        name: 'healthicons',
        version: '1.0.0', // Based on package.json of healthicons?
        totalIcons: icons.length,
        icons: icons,
        attributes: {
            license: 'MIT',
            url: 'https://healthicons.org'
        }
    };

    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(manifest));
    console.log(`✅ Saved health.json with ${successCount} icons (${errorCount} errors)`);

} catch (error) {
    console.error('❌ Extraction failed:', error);
    process.exit(1);
}
