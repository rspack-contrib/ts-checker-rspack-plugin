import { defineConfig } from '@rstest/core';

// Disable color in test
process.env.NO_COLOR = '1';
process.env.FORCE_COLOR = '0';

export default defineConfig({
  root: __dirname,
  globals: true,
  source: {
    tsconfigPath: '../tsconfig.json',
  },
  output: {
    module: true,
  }
});
