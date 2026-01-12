/**
 * Generate manifests for Slides Icons using GitHub API
 * Creates lightweight JSON with icon names and CDN URLs
 * 
 * IMPORTANT: Uses GitHub-backed CDN (jsdelivr.net/gh) to ensure
 * icon names from GitHub API match available CDN files.
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

const DIST_DIR = path.join(__dirname, '..', 'src', 'manifests');

if (!fs.existsSync(DIST_DIR)) {
    fs.mkdirSync(DIST_DIR, { recursive: true });
}

// Library configurations with GitHub paths and CDN patterns
// Using GitHub-backed CDN to ensure consistency between API and CDN
const LIBRARIES = [
    {
        id: 'bootstrap',
        name: 'Bootstrap Icons',
        count: 2050,
        githubPath: '/repos/twbs/icons/contents/icons',
        cdnPattern: 'https://cdn.jsdelivr.net/gh/twbs/icons@main/icons/{name}.svg'
    },
    {
        id: 'heroicons',
        name: 'Heroicons',
        count: 592,
        githubPath: '/repos/tailwindlabs/heroicons/contents/src/24/outline',
        cdnPattern: 'https://cdn.jsdelivr.net/gh/tailwindlabs/heroicons@main/src/24/outline/{name}.svg'
    },
    {
        id: 'feather',
        name: 'Feather Icons',
        count: 287,
        githubPath: '/repos/feathericons/feather/contents/icons',
        cdnPattern: 'https://cdn.jsdelivr.net/gh/feathericons/feather@main/icons/{name}.svg'
    },
    {
        id: 'lucide',
        name: 'Lucide Icons',
        count: 1500,
        githubPath: '/repos/lucide-icons/lucide/contents/icons',
        cdnPattern: 'https://cdn.jsdelivr.net/gh/lucide-icons/lucide@main/icons/{name}.svg'
    },
    {
        id: 'ionicons',
        name: 'Ionicons',
        count: 1300,
        githubPath: '/repos/ionic-team/ionicons/contents/src/svg',
        cdnPattern: 'https://cdn.jsdelivr.net/gh/ionic-team/ionicons@main/src/svg/{name}.svg'
    },
    {
        id: 'iconoir',
        name: 'Iconoir',
        count: 1500,
        githubPath: '/repos/iconoir-icons/iconoir/contents/icons/regular',
        cdnPattern: 'https://cdn.jsdelivr.net/gh/iconoir-icons/iconoir@main/icons/regular/{name}.svg'
    },
    {
        id: 'phosphor',
        name: 'Phosphor Icons',
        count: 7000,
        githubPath: '/repos/phosphor-icons/core/contents/assets/regular',
        cdnPattern: 'https://cdn.jsdelivr.net/gh/phosphor-icons/core@main/assets/regular/{name}.svg'
    },
    {
        id: 'box',
        name: 'Boxicons',
        count: 1600,
        githubPath: '/repos/atisawd/boxicons/contents/svg/regular',
        cdnPattern: 'https://cdn.jsdelivr.net/gh/atisawd/boxicons@master/svg/regular/{name}.svg'
    },
    {
        id: 'oct',
        name: 'GitHub Octicons',
        count: 500,
        githubPath: '/repos/primer/octicons/contents/icons',
        cdnPattern: 'https://cdn.jsdelivr.net/gh/primer/octicons@main/icons/{name}.svg'
    },
    {
        id: 'radix',
        name: 'Radix Icons',
        count: 322,
        githubPath: '/repos/radix-ui/icons/contents/packages/radix-icons/icons',
        cdnPattern: 'https://cdn.jsdelivr.net/gh/radix-ui/icons@master/packages/radix-icons/icons/{name}.svg'
    },
    {
        id: 'healthicons',
        name: 'Health Icons',
        count: 1000,
        githubPath: '/repos/resolvetosavelives/healthicons/contents/public/icons/svg/outline',
        cdnPattern: 'https://cdn.jsdelivr.net/gh/resolvetosavelives/healthicons@main/public/icons/svg/outline/{name}.svg'
    },
    {
        id: 'eva',
        name: 'Eva Icons',
        count: 490,
        githubPath: '/repos/akveo/eva-icons/contents/package/icons/outline/svg',
        cdnPattern: 'https://cdn.jsdelivr.net/gh/akveo/eva-icons@master/package/icons/outline/svg/{name}.svg'
    }
];

// Fetch from GitHub API with basic recursion
function fetchGitHub(path) {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'api.github.com',
            path: path,
            headers: {
                'User-Agent': 'Slides-Icons-Manifest-Generator',
                'Accept': 'application/vnd.github.v3+json'
            }
        };

        https.get(options, (res) => {
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
                response.on('end', async () => {
                    try {
                        // Rate limit check
                        if (response.statusCode === 403 || response.statusCode === 429) {
                            throw new Error('GitHub API rate limit exceeded');
                        }

                        const items = JSON.parse(data);
                        if (!Array.isArray(items)) {
                            // If it's a single file, return it in an array
                            if (items.name) return resolve([items]);
                            return resolve([]);
                        }

                        let results = [];
                        for (const item of items) {
                            if (item.type === 'file' && item.name.endsWith('.svg')) {
                                results.push(item);
                            } else if (item.type === 'dir') {
                                // Recursive fetch with delay
                                console.log(`    Scanning subfolder: ${item.name}...`);
                                await new Promise(r => setTimeout(r, 1000));
                                try {
                                    const nextPath = new URL(item.url).pathname;
                                    const subFiles = await fetchGitHub(nextPath);
                                    results = results.concat(subFiles);
                                } catch (err) {
                                    console.error(`    Skipping subfolder ${item.name}: ${err.message}`);
                                }
                            }
                        }
                        resolve(results);
                    } catch (e) {
                        reject(new Error(`Parse error or API error: ${e.message}`));
                    }
                });
            }
        }).on('error', reject);
    });
}

// Generate manifest for a library
async function generateManifest(lib) {
    console.log(`\n📦 ${lib.name}`);

    try {
        const files = await fetchGitHub(lib.githubPath);

        if (!Array.isArray(files)) {
            console.log(`  ⚠ Unexpected response checking ${lib.name}`);
            return;
        }

        const libraryBasePath = lib.githubPath.replace(/^\/repos\/[^\/]+\/[^\/]+\/contents\//, '');

        const icons = files
            .filter(f => f.name.endsWith('.svg'))
            .map(f => {
                let name = f.path;
                if (name.startsWith(libraryBasePath)) {
                    name = name.substring(libraryBasePath.length);
                }
                // allow for leading slash
                if (name.startsWith('/')) name = name.substring(1);

                name = name.replace('.svg', '');

                const baseName = f.name.replace('.svg', '');

                return {
                    name: name,
                    title: baseName.replace(/[-_]/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
                };
            });

        const manifest = {
            id: lib.id,
            name: lib.name,
            version: '1.0.0',
            cdnPattern: lib.cdnPattern,
            totalIcons: icons.length,
            icons: icons
        };

        const outputPath = path.join(DIST_DIR, `${lib.id}.json`);
        fs.writeFileSync(outputPath, JSON.stringify(manifest, null, 2));
        console.log(`  ✓ Saved ${lib.id}.json (${icons.length} icons)`);

    } catch (error) {
        console.log(`  ⚠ Failed: ${error.message}`);
    }

    // Rate limit protection for main loop
    await new Promise(r => setTimeout(r, 2000));
}

// Main
async function main() {
    console.log('🎨 Generating Slides Icons manifests... (this may take a moment due to rate limits)\n');

    for (const lib of LIBRARIES) {
        await generateManifest(lib);
    }

    // Generate Index
    console.log('\n📚 Generating Library Index...');
    try {
        const index = LIBRARIES.map(lib => {
            const manifestPath = path.join(DIST_DIR, `${lib.id}.json`);
            if (fs.existsSync(manifestPath)) {
                const content = JSON.parse(fs.readFileSync(manifestPath));
                return {
                    id: lib.id,
                    name: lib.name,
                    totalIcons: content.totalIcons // Matches taskpane.js expectation
                };
            } else {
                return {
                    id: lib.id,
                    name: lib.name,
                    totalIcons: 0
                };
            }
        }).filter(l => l.totalIcons > 0);

        fs.writeFileSync(path.join(DIST_DIR, 'index.json'), JSON.stringify(index, null, 2));
        console.log(`  ✓ Saved index.json with ${index.length} libraries`);
    } catch (err) {
        console.error('  ⚠ Failed to generate index:', err);
    }

    console.log('\n✅ Manifest generation complete!\n');
}

main().catch(console.error);
