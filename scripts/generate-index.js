
const fs = require('fs');
const path = require('path');

const MANIFESTS_DIR = path.join(__dirname, '..', 'src', 'manifests');
const OUT_FILE = path.join(MANIFESTS_DIR, 'index.json');

const files = fs.readdirSync(MANIFESTS_DIR).filter(f => f.endsWith('.json') && f !== 'index.json');
const libraries = [];

files.forEach(file => {
    try {
        const content = fs.readFileSync(path.join(MANIFESTS_DIR, file), 'utf8');
        const json = JSON.parse(content);

        if (!json.id) console.warn(`Warning: No ID in ${file}`);

        libraries.push({
            id: json.id || file.replace('.json', ''),
            name: json.name || json.id || file.replace('.json', ''),
            totalIcons: json.totalIcons || 0,
            version: json.version || '1.0.0'
        });
    } catch (e) {
        console.error(`Error reading ${file}:`, e);
    }
});

// Sort by name
libraries.sort((a, b) => (a.name || '').localeCompare(b.name || ''));

fs.writeFileSync(OUT_FILE, JSON.stringify(libraries, null, 2));
console.log(`Generated index.json with ${libraries.length} libraries`);
