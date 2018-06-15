const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');
const Parcel = require('parcel-bundler');

const PORT = 8642;

(async () => {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    const server = await serve();

    try {
        const results = await testPage(page);
        save(results);
    } catch (error) {
        console.error(error);
    }

    await browser.close();
    server.close();
})();

async function testPage(page) {
    page.on('console', msg => {
        console.dir(msg);
        process.exit(1);
    });

    await page.goto(`http://localhost:${PORT}`);
    await page.waitFor(1000);

    const json = await page.evaluate(getPerformanceResults);
    const result = JSON.parse(json);

    return result.map(({ name, duration }) => {
        const [ key, entities, frame ] = name.split('-');

        return {
            name: key,
            entities: parseInt(entities),
            frame: frame ? parseInt(frame) : undefined,
            duration,
        };
    });
}

function save(results) {
    const route = path.join(__dirname, '../performance.json');
    fs.writeFileSync(route, JSON.stringify(results, null, 2));
}

async function serve() {
    const url = path.join(__dirname, 'runner.html');

    const bundler = new Parcel(url, {
        watch: false,
        target: 'browser',
        sourceMaps: false,
    });

    return bundler.serve(PORT);
}

function getPerformanceResults() {
    const results = window.performance.getEntriesByType('measure');
    return JSON.stringify(results);
}