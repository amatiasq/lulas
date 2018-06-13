import Vector from '../src/vector';

export default {

    load(id: string) {
        const json = localStorage.getItem(id);

        return json ? JSON.parse(json, vectorReviver) : null;
    },

    save(state: any) {
        const id = getFormattedDate(new Date());
        const json = JSON.stringify(state)

        localStorage.setItem(id, json);

        this.trim();
    },

    rename(id: string, newName: string) {
        localStorage.setItem(newName, localStorage.getItem(id));
    },

    log() {
        const keys = Object.keys(localStorage);

        if (!keys.length) {
            return;
        }

        console.log(`Found stored states:`);

        for (const key of keys) {
            console.log(`  load("${key}")`);
        }
    },

    trim() {
        const keys = Object.keys(localStorage);

        while (keys.length > 10) {
            if (isDate(keys[0])) {
                localStorage.removeItem(keys[0]);
            }

            keys.shift();
        }
    }

};

function vectorReviver(key, value) {
    if (typeof value === 'object' && 'x' in value && 'y' in value) {
        return Vector.from(value);
    }

    return value;
}

function pad(value: number, length: number) {
    return (String(value) as any).padStart(length, '0');
}

function getFormattedDate(value: Date) {
    const year = value.getFullYear();
    const month = pad(value.getMonth() + 1, 2);
    const date = pad(value.getDate(), 2);
    const hour = pad(value.getHours(), 2);
    const minutes = pad(value.getMinutes(), 2);
    const seconds = pad(value.getSeconds(), 2);
    const milliseconds = pad(value.getMilliseconds(), 3);

    return `${year}-${month}-${date} ${hour}:${minutes}:${seconds}.${milliseconds}`;
}

function isDate(value: string) {
    return getFormattedDate(new Date(value)) === value;
}