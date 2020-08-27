module.exports = {
  setupFiles: ['jest-canvas-mock'],
  collectCoverageFrom: ['src/**/*.ts'],
  transform: {
    '^.+\\.ts?$': 'ts-jest',
  },
};
