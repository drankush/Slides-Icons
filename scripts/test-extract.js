
const fs = require('fs');
const LZString = require('lz-string');

// Test with bootstrap
const file = 'node_modules/open-icons/dist/open-icons-bootstrap.js';
const content = fs.readFileSync(file, 'utf8');

// Regex matches regex I used before
const match = content.match(/"([^"]{1000,})"/);

if (match) {
    console.log('Found compressed string, length:', match[1].length);
    const compressed = match[1];

    // Try LZString decompressFromBase64
    let decompressed = LZString.decompressFromBase64(compressed);

    if (decompressed && decompressed.startsWith('{')) {
        console.log('✅ Decompressed successfully with decompressFromBase64!');
        console.log('Start:', decompressed.substring(0, 50));
    } else {
        console.log('❌ decompressFromBase64 failed');
        // Try other methods
        decompressed = LZString.decompress(compressed);
        if (decompressed && decompressed.startsWith('{')) {
            console.log('✅ Decompressed successfully with decompress!');
        } else {
            console.log('❌ decompress failed');
            // Try UTF16
            decompressed = LZString.decompressFromUTF16(compressed);
            if (decompressed && decompressed.startsWith('{')) {
                console.log('✅ Decompressed successfully with decompressFromUTF16!');
            } else {
                console.log('❌ all failed');
            }
        }
    }
} else {
    console.log('No compressed string found');
}
