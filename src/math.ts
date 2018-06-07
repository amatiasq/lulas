export const TAU = Math.PI * 2;

export const abs = Math.abs;
export const sqrt = Math.sqrt;
export const pow = Math.pow;

export function random(min: number, max: number) {
    if (arguments.length === 0) {
        return Math.random();
    } else if (arguments.length === 1) {
        max = min;
        min = 0;
    }

    return Math.round(Math.random() * (max - min)) + min;
}

//
// Round
//

const roundOperators = [ 1, 10, 100 ];

function getRoundOperator(digits: number) {
    while (roundOperators.length < digits + 1) {
        roundOperators.push(Math.pow(10, roundOperators.length + 1));
    }

    return roundOperators[digits];
}

export function round(value: number, decimals = 2) {
    if (decimals === 0) {
        return Math.round(value);
    }

    const operator = getRoundOperator(decimals);
    return Math.round(value * operator) / operator;
}
