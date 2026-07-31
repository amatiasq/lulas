import { round } from '../../src/math';

export default function toBeFalse(received, argument, decimals = 2) {
    const pass = received === argument || round(received, decimals) === round(argument, decimals)
    const diff = received === false;

    return {
        pass,
        message: pass
            ? () => `expected ${received} not to be aproximately ${argument}`
            : () => `expected ${received} to be aproximately ${argument}`,
    };
}
