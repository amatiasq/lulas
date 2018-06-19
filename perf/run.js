const fs = require('fs');
const path = require('path');
const chalk = require('chalk');
const getResults = require('./chrome');
const serve = require('./parcel');
const previous = require('../performance.json');

const PORT = 8642;

(async () => {
    const server = await serve(PORT);
    const results = await getResults(`http://localhost:${PORT}`);

    server.close();

    const average = compareResults(results, previous);

    save(results);
})();

function save(results) {
    const route = path.join(__dirname, '../performance.json');
    fs.writeFileSync(route, JSON.stringify(results, null, 2));
}

function compareResults(results, previous) {
    const difference = [];

    for (const entry of results) {
        for (const prev of previous) {
            if (
                entry.name === prev.name &&
                entry.entities === prev.entities &&
                entry.frame === prev.frame
            ) {
                const diff = compare(entry.duration, prev.duration);

                if (entry.frame == null) {
                    console.log(`${entry.name}-${entry.entities} takes now: ${print(diff)} as before`);
                }

                difference.push(diff);
            }
        }
    }

    const sum = difference.reduce((a, b) => a + b);
    const average = sum / difference.length;

    console.log(`Average: ${print(average)}`)

    return average;
}

function compare(current, old) {
    if (old === 0) {
        return 0;
    }

    return current / old;
}

function print(value) {
    const percent = Math.round(value * 10000) / 100;

    return `${paint(percent)}%`;
}

function paint(value) {
    if (value < 100) {
        return chalk.green(value);
    }

    if (value > 100) {
        return chalk.red(value);
    }

    return value;
}