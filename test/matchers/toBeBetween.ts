import { min, max } from '../../src/math';

export default function toBeFalse(received, a, b) {
    const first = min(a, b);
    const second = max(a, b);
    const pass = first < received && received < second;

    return {
        pass,
        message: pass
            ? () => `expected ${received} not to be between ${a} and ${b}`
            : () => `expected ${received} to be between ${a} and ${b}`,
    };
}
