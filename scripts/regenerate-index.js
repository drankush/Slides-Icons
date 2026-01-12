/**
 * Regenerate index.json from manifest files
 */
const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, '..', 'src', 'manifests');
const files = fs.readdirSync(dir).filter(f => f.endsWith('.json') && f !== 'index.json');

const index = files.map(f => {
    try {
        const data = JSON.parse(fs.readFileSync(path.join(dir, f)));
        if (!data.id) {
            console.log('  ⚠ Missing id:', f);
            return null;
        }
        return {
            id: data.id,
            name: data.name || data.id,
            totalIcons: data.totalIcons || (data.icons ? data.icons.length : 0)
        };
    } catch (e) {
        console.log('  ❌ Error:', f, e.message);
        return null;
    }
}).filter(Boolean).sort((a, b) => a.id.localeCompare(b.id));

fs.writeFileSync(path.join(dir, 'index.json'), JSON.stringify(index, null, 2));
console.log(`✅ Generated index.json with ${index.length} libraries`);
