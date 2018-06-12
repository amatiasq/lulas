export default function toBeFalse(received) {
    const pass = received === false;

    return {
        pass,
        message: pass
            ? () => `expected ${received} not to be false`
            : () => `expected ${received} to be false`,
    };
}
