import { fileURLToPath } from 'node:url';
import { defaultClientConditions } from 'vite';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  // Same shim as `flocking/`: the npm `assert` polyfill needs `process`/`util`
  // and throws in a browser bundle. The local one works in both environments.
  resolve: {
    // `bun` first, and load-bearing. The `exports` de `@amatiasq/geometry` y
    // `@amatiasq/quadtree` mandan a `./src/index.ts` bajo la condición `bun` y a
    // `./dist/index.js` en cualquier otra, y `npm/*/dist/` está gitignorado: sin
    // esto, vite y vitest piden un `dist/` que sólo existe en la máquina de quien
    // lo construyó una vez. Verde en el portátil, rojo en CI, y la diferencia
    // invisible. Con la condición, source directo y nada que construir antes.
    conditions: ['bun', ...defaultClientConditions],
    alias: {
      assert: fileURLToPath(new URL('./test/assert.ts', import.meta.url)),
    },
  },
  // Specs call `setFilename(__dirname, __filename)` for a display label only.
  define: {
    __dirname: '""',
    __filename: '""',
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./test/setup.ts'],
    include: ['user-stories/**/*.test.ts'],
  },
});
