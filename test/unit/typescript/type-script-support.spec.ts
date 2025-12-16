import os from 'os';

import type { TypeScriptWorkerConfig } from 'src/typescript/type-script-worker-config';

describe('typescript/type-script-support', () => {
  let configuration: TypeScriptWorkerConfig;

  beforeEach(() => {
    rs.resetModules();

    configuration = {
      configFile: './tsconfig.json',
      configOverwrite: {},
      context: '.',
      build: false,
      mode: 'readonly',
      diagnosticOptions: {
        declaration: false,
        global: true,
        semantic: true,
        syntactic: false,
      },
      enabled: true,
      memoryLimit: 8192,
      profile: false,
      typescriptPath: require.resolve('typescript'),
    };
  });

  it('throws error if typescript is not installed', async () => {
    rs.setMock('typescript', undefined);

    const { assertTypeScriptSupport } = await import('src/typescript/type-script-support');

    expect(() => assertTypeScriptSupport(configuration)).toThrowError(
      'When you use TsCheckerRspackPlugin with typescript reporter enabled, you must install `typescript` package.'
    );
  });

  it('throws error if there is no tsconfig.json file', async () => {
    rs.setMock('typescript', { version: '3.8.0' });
    rs.setMock('node:fs', { existsSync: () => false });

    const { assertTypeScriptSupport } = await import('src/typescript/type-script-support');

    expect(() => assertTypeScriptSupport(configuration)).toThrowError(
      [
        `Cannot find the "./tsconfig.json" file.`,
        `Please check webpack and TsCheckerRspackPlugin configuration.`,
        `Possible errors:`,
        '  - wrong `context` directory in webpack configuration (if `configFile` is not set or is a relative path in the fork plugin configuration)',
        '  - wrong `typescript.configFile` path in the plugin configuration (should be a relative or absolute path)',
      ].join(os.EOL)
    );
  });
});
