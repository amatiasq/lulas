import { setFilename, test } from '../test/index';

setFilename(__dirname, __filename);

// Smoke test: proves the harness registers and runs a spec at all.
test('Should run tests', () => {
  // Reaching here without throwing is the assertion.
});
