/**
 * Generate manifests for Slides Icons using GitHub API
 * Creates lightweight JSON with icon names and CDN URLs
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

const DIST_DIR = path.join(__dirname, '..', 'src', 'manifests');

if (!fs.existsSync(DIST_DIR)) {
    fs.mkdirSync(DIST_DIR, { recursive: true });
}

// Library configurations with GitHub paths and CDN patterns
const LIBRARIES = [
    {
        id: 'bootstrap',
        name: 'Bootstrap Icons',
        count: 2050,
        githubPath: '/repos/twbs/icons/contents/icons',
        cdnPattern: 'https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/icons/{name}.svg'
    },
    {
        id: 'heroicons',
        name: 'Heroicons',
        count: 592,
        githubPath: '/repos/tailwindlabs/heroicons/contents/src/24/outline',
        cdnPattern: 'https://cdn.jsdelivr.net/npm/heroicons@2.1.3/24/outline/{name}.svg'
    },
    {
        id: 'feather',
        name: 'Feather Icons',
        count: 287,
        githubPath: '/repos/feathericons/feather/contents/icons',
        cdnPattern: 'https://cdn.jsdelivr.net/npm/feather-icons@4.29.1/dist/icons/{name}.svg'
    },
    {
        id: 'lucide',
        name: 'Lucide Icons',
        count: 1500,
        githubPath: '/repos/lucide-icons/lucide/contents/icons',
        cdnPattern: 'https://cdn.jsdelivr.net/npm/lucide-static@0.378.0/icons/{name}.svg'
    },
    {
        id: 'tabler',
        name: 'Tabler Icons',
        count: 4969,
        githubPath: '/repos/tabler/tabler-icons/contents/icons/outline',
        cdnPattern: 'https://cdn.jsdelivr.net/npm/@tabler/icons@3.5.0/icons/outline/{name}.svg'
    },
    {
        id: 'ionicons',
        name: 'Ionicons',
        count: 1300,
        githubPath: '/repos/ionic-team/ionicons/contents/src/svg',
        cdnPattern: 'https://cdn.jsdelivr.net/npm/ionicons@7.4.0/dist/svg/{name}.svg'
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
        cdnPattern: 'https://cdn.jsdelivr.net/npm/@phosphor-icons/core@2.1.1/assets/regular/{name}.svg'
    },
    {
        id: 'boxicons',
        name: 'Boxicons',
        count: 1600,
        githubPath: '/repos/atisawd/boxicons/contents/svg/regular',
        cdnPattern: 'https://cdn.jsdelivr.net/npm/boxicons@2.1.4/svg/regular/{name}.svg'
    },
    {
        id: 'octicons',
        name: 'GitHub Octicons',
        count: 500,
        githubPath: '/repos/primer/octicons/contents/icons',
        cdnPattern: 'https://cdn.jsdelivr.net/npm/@primer/octicons@19.9.0/build/svg/{name}-24.svg'
    },
    {
        id: 'radix',
        name: 'Radix Icons',
        count: 322,
        githubPath: '/repos/radix-ui/icons/contents/packages/radix-icons/icons',
        cdnPattern: 'https://cdn.jsdelivr.net/npm/@radix-ui/react-icons@1.3.0/dist/{name}.svg'
    },
    {
        id: 'eva',
        name: 'Eva Icons',
        count: 490,
        githubPath: '/repos/akveo/eva-icons/contents/package/icons/outline/svg',
        cdnPattern: 'https://cdn.jsdelivr.net/npm/eva-icons@1.1.3/outline/svg/{name}.svg'
    }
];

// Fetch from GitHub API
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
                response.on('end', () => {
                    try {
                        resolve(JSON.parse(data));
                    } catch (e) {
                        reject(new Error(`Parse error: ${data.substring(0, 100)}`));
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
            console.log(`  ⚠ Unexpected response: ${JSON.stringify(files).substring(0, 100)}`);
            return;
        }

        const icons = files
            .filter(f => f.name.endsWith('.svg'))
            .map(f => {
                const name = f.name.replace('.svg', '');
                return {
                    name: name,
                    title: name.replace(/[-_]/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
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

    // Rate limit protection
    await new Promise(r => setTimeout(r, 1000));
}

// Main
async function main() {
    console.log('🎨 Generating Slides Icons manifests...\n');

    for (const lib of LIBRARIES) {
        await generateManifest(lib);
    }

    console.log('\n✅ Manifest generation complete!\n');
}

main().catch(console.error);
