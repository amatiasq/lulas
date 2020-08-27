module.exports = {
  setupFiles: ['jest-canvas-mock'],
  collectCoverageFrom: ['src/**/*.ts'],
  transform: {
    '^.+\\.ts?$': 'ts-jest',
  },
  globals: {
    'ts-jest': {
      // ...
      diagnostics: {
        ignoreCodes: [151001],
      },
    },
  },
};
