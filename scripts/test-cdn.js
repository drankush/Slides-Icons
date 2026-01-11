
const fetch = require('node-fetch');

async function checkUrl(url) {
    try {
        const res = await fetch(url);
        console.log(`${res.status} ${url}`);
    } catch (e) {
        console.log(`ERR ${url} : ${e.message}`);
    }
}

async function test() {
    // Octicons test
    // Current pattern: https://cdn.jsdelivr.net/npm/@primer/octicons@19.9.0/build/svg/{name}-24.svg
    // Icon name: accessibility-24
    // Generated: accessibility-24-24.svg (WRONG)
    await checkUrl('https://cdn.jsdelivr.net/npm/@primer/octicons@19.9.0/build/svg/accessibility-24.svg');

    // Radix test
    // Current pattern: https://cdn.jsdelivr.net/npm/@radix-ui/react-icons@1.3.0/dist/{name}.svg
    // Icon name: accessibility
    await checkUrl('https://cdn.jsdelivr.net/npm/@radix-ui/react-icons@1.3.0/dist/accessibility.svg');
    // Maybe it's not in dist root?
    await checkUrl('https://cdn.jsdelivr.net/npm/@radix-ui/react-icons@1.3.0/icons/accessibility.svg');
}

test();
