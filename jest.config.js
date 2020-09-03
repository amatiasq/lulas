module.exports = {
  setupFiles: ['jest-canvas-mock'],
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
