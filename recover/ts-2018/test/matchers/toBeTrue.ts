export default function toBeTrue(received) {
    const pass = received === true;

    return {
        pass,
        message: pass
            ? () => `expected ${received} not to be true`
            : () => `expected ${received} to be true`,
    };
}
