// Disable color in test
process.env.NO_COLOR = '1';
process.env.FORCE_COLOR = '0';

module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testRunner: 'jest-circus/runner',
  rootDir: '.',
  moduleNameMapper: {
    '^src/(.*)$': '<rootDir>/../../src/$1',
  },
  globals: {
    'ts-jest': {
      tsconfig: '<rootDir>/../tsconfig.json',
    },
  },
};
