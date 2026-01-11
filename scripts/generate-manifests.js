/**
 * Generate manifests for all icon libraries using GitHub API
 * Updated with correct endpoints from user research
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

const MANIFESTS_DIR = path.join(__dirname, '..', 'src', 'manifests');

// Ensure manifests directory exists
if (!fs.existsSync(MANIFESTS_DIR)) {
    fs.mkdirSync(MANIFESTS_DIR, { recursive: true });
}

// Helper to fetch JSON from GitHub API
function fetchGitHubAPI(path) {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'api.github.com',
            path: path,
            headers: {
                'User-Agent': 'OpenIcons-Manifest-Generator',
                'Accept': 'application/vnd.github.v3+json'
            }
        };

        https.get(options, (res) => {
            // Handle redirects
            if (res.statusCode === 301 || res.statusCode === 302) {
                const redirectUrl = new URL(res.headers.location);
                options.hostname = redirectUrl.hostname;
                options.path = redirectUrl.pathname;
                https.get(options, handleResponse).on('error', reject);
                return;
            }
            handleResponse(res);

            function handleResponse(response) {
                let data = '';
                response.on('data', chunk => data += chunk);
                response.on('end', () => {
                    try {
                        resolve(JSON.parse(data));
                    } catch (e) {
                        reject(new Error(`Failed to parse: ${data.substring(0, 100)}`));
                    }
                });
            }
        }).on('error', reject);
    });
}

// Save manifest to file
function saveManifest(name, data) {
    const filePath = path.join(MANIFESTS_DIR, `${name}.json`);
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    const iconCount = data.totalIcons || Object.values(data.icons || {}).flat().length;
    console.log(`  ✓ Saved ${name}.json (${iconCount} icons)`);
}

// ============================================
// Iconoir - /icons/regular/ directory
// ============================================
async function generateIconoirManifest() {
    console.log('\n📦 Iconoir');
    try {
        const files = await fetchGitHubAPI('/repos/iconoir-icons/iconoir/contents/icons/regular');

        if (!Array.isArray(files)) {
            throw new Error('Unexpected response format');
        }

        const icons = files
            .filter(f => f.name.endsWith('.svg'))
            .map(f => ({
                name: f.name.replace('.svg', ''),
                title: f.name.replace('.svg', '').replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
            }));

        saveManifest('iconoir', {
            version: '1.0.0',
            totalIcons: icons.length,
            icons: { 'all': icons }
        });
    } catch (error) {
        console.log(`  ⚠ Failed: ${error.message}`);
    }
}

// ============================================
// Remix Icon - /icons/{Category}/ directories
// ============================================
async function generateRemixIconManifest() {
    console.log('\n📦 Remix Icon');
    try {
        // Get categories
        const categories = await fetchGitHubAPI('/repos/Remix-Design/RemixIcon/contents/icons');

        if (!Array.isArray(categories)) {
            throw new Error('Unexpected response format');
        }

        const icons = {};
        let totalIcons = 0;

        // Fetch icons from each category
        for (const cat of categories.filter(c => c.type === 'dir')) {
            console.log(`    Fetching ${cat.name}...`);
            try {
                const catFiles = await fetchGitHubAPI(`/repos/Remix-Design/RemixIcon/contents/icons/${cat.name}`);

                if (Array.isArray(catFiles)) {
                    // Get unique base names (remove -line, -fill suffix)
                    const baseNames = new Set();
                    catFiles
                        .filter(f => f.name.endsWith('.svg'))
                        .forEach(f => {
                            const baseName = f.name.replace('.svg', '').replace(/-line$|-fill$/, '');
                            baseNames.add(baseName);
                        });

                    icons[cat.name] = Array.from(baseNames).map(name => ({
                        name: name,
                        title: name.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
                    }));
                    totalIcons += icons[cat.name].length;
                }
            } catch (e) {
                console.log(`      ⚠ Failed to fetch ${cat.name}`);
            }

            // Rate limit protection
            await new Promise(r => setTimeout(r, 500));
        }

        saveManifest('remixicon', {
            version: '1.0.0',
            totalIcons: totalIcons,
            icons: icons
        });
    } catch (error) {
        console.log(`  ⚠ Failed: ${error.message}`);
    }
}

// ============================================
// Boxicons - /svg/{style}/ directories
// ============================================
async function generateBoxiconsManifest() {
    console.log('\n📦 Boxicons');
    try {
        // Use the correct repo (box-icons instead of atisawd)
        const regularFiles = await fetchGitHubAPI('/repos/atisawd/boxicons/contents/svg/regular');

        if (!Array.isArray(regularFiles)) {
            throw new Error('Unexpected response format');
        }

        const icons = regularFiles
            .filter(f => f.name.endsWith('.svg'))
            .map(f => {
                // Boxicons naming: bx-icon-name.svg -> icon-name
                const name = f.name.replace('.svg', '').replace(/^bx-/, '');
                return {
                    name: name,
                    title: name.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
                };
            });

        saveManifest('boxicons', {
            version: '1.0.0',
            totalIcons: icons.length,
            icons: { 'all': icons }
        });
    } catch (error) {
        console.log(`  ⚠ Failed: ${error.message}`);
    }
}

// ============================================
// Ionicons - improve existing manifest
// ============================================
async function generateIoniconsManifest() {
    console.log('\n📦 Ionicons');
    try {
        const files = await fetchGitHubAPI('/repos/ionic-team/ionicons/contents/src/svg');

        if (!Array.isArray(files)) {
            throw new Error('Unexpected response format');
        }

        // Extract unique base names (remove -outline, -sharp suffixes)
        const baseNames = new Set();
        files
            .filter(f => f.name.endsWith('.svg'))
            .forEach(f => {
                const name = f.name.replace('.svg', '').replace(/-outline$|-sharp$/, '');
                baseNames.add(name);
            });

        const icons = Array.from(baseNames).sort().map(name => ({
            name: name,
            title: name.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
        }));

        saveManifest('ionicons', {
            version: '1.0.0',
            totalIcons: icons.length,
            icons: { 'all': icons }
        });
    } catch (error) {
        console.log(`  ⚠ Failed: ${error.message}`);
    }
}

// ============================================
// Main
// ============================================
async function main() {
    console.log('🎨 Generating icon manifests for OpenIcons...');
    console.log('   (Using GitHub API - may take a minute)\n');

    await generateIconoirManifest();
    await generateIoniconsManifest();
    await generateBoxiconsManifest();
    await generateRemixIconManifest();  // This one takes longest due to multiple requests

    console.log('\n✅ Manifest generation complete!\n');
}

main().catch(console.error);
