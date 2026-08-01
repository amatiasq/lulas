import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  // Same shim as `flocking/`: the npm `assert` polyfill needs `process`/`util`
  // and throws in a browser bundle. The local one works in both environments.
  resolve: {
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
