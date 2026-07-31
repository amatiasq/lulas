const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');
const Parcel = require('parcel-bundler');

module.exports = getResults;

async function getResults(url) {
    const browser = await puppeteer.launch();

    try {
        const page = await browser.newPage();

        page.on('console', msg => {
            console.dir(msg);
            process.exit(1);
        });

        await page.goto(url);

        const json = await page.evaluate(getPerformanceResults);
        const result = JSON.parse(json);

        return result.map(parseMeasure);

    } catch (error) {
        console.error(error);
    } finally {
        await browser.close();
    }

    process.exit(1);
}

function parseMeasure({ name, duration }) {
    const [ key, entities, frame ] = name.split('-');

    return {
        name: key,
        entities: parseInt(entities),
        frame: frame ? parseInt(frame) : undefined,
        duration,
    };
}

function getPerformanceResults() {
    const results = window.performance.getEntriesByType('measure');
    return JSON.stringify(results);
}