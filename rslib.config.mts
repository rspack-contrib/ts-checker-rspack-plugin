import { defineConfig } from '@rslib/core';

export default defineConfig({
  lib: [
    {
      source: {
        entry: {
          index: './src/index.ts',
          'getIssuesWorker': './src/typescript/worker/get-issues-worker.ts',
          'getDependenciesWorker': './src/typescript/worker/get-dependencies-worker.ts',
        },
      },
      format: 'cjs',
      syntax: 'es2021',
      output: {
        distPath: 'lib',
      },
      dts: true,
    },
  ],
});
