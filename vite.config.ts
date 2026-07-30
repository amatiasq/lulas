import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  // Point `assert` at a tiny local shim. The npm polyfill needs `process`/`util`
  // and throws in the browser bundle; the shim works in both browser and node.
  resolve: {
    alias: {
      assert: fileURLToPath(new URL('./test/assert.ts', import.meta.url)),
    },
  },
  // Test files call `setFilename(__dirname, __filename)`, shims webpack used to
  // inject via `node: { __dirname, __filename }`. They only feed a display label
  // for console grouping, so empty strings are fine in the browser.
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
