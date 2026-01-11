
const fs = require('fs');
const path = require('path');
const jsdom = require("jsdom");
const { JSDOM } = jsdom;

const OPEN_ICONS_DIR = path.join(__dirname, '..', 'node_modules', 'open-icons', 'dist');

const dom = new JSDOM(`<!DOCTYPE html><p>Debug</p>`, {
    runScripts: "dangerously",
    resources: "usable"
});
const { window } = dom;

// Polyfill globals
global.window = window;
global.document = window.document;
global.self = window;
global.navigator = window.navigator;

const mainBundlePath = path.join(OPEN_ICONS_DIR, 'open-icons.js');

try {
    const code = fs.readFileSync(mainBundlePath, 'utf8');
    // Using window.eval to execute in JSDOM context
    window.eval(code);

    console.log('--- Window properties ---');
    console.log(Object.keys(window).filter(k => !k.startsWith('HTML') && !k.startsWith('DOM')));

    console.log('\n--- OpenIcons check ---');
    if (window.OpenIcons) {
        console.log('window.OpenIcons exists');
        console.log('Keys:', Object.keys(window.OpenIcons));
    } else {
        console.log('window.OpenIcons is undefined');
    }

    // Maybe it exports to 'module.exports' if it detects CommonJS?
    // But JSDOM environment shouldn't have module/exports unless I define them.
    // Wait, I am running in Node, so 'module' and 'exports' ARE defined in the global scope of THIS script,
    // but window.eval executes in JSDOM sandbox? 
    // Actually, JSDOM runScripts: "dangerously" runs in separate context but global properties might leak if I polyfilled them on `global`.
    // If the UMD wrapper sees 'exports', it might try to use it.

    // Let's try to define a fake module object in window
    window.module = { exports: {} };
    window.exports = window.module.exports;

    window.eval(code);

    console.log('\n--- Module exports check ---');
    console.log('window.module.exports keys:', Object.keys(window.module.exports));

} catch (e) {
    console.error(e);
}
