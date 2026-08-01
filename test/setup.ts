import { vi } from 'vitest';

// jest-canvas-mock reaches for a global `jest`; under Vitest that's `vi`.
(globalThis as unknown as { jest: typeof vi }).jest = vi;

await import('jest-canvas-mock');
