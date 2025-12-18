import os from 'node:os';
import fs from 'node:fs';

import type { TypeScriptWorkerConfig } from './type-script-worker-config';

function assertTypeScriptSupport(config: TypeScriptWorkerConfig) {
  let typescriptVersion: string | undefined;

  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    typescriptVersion = require(config.typescriptPath).version;
  } catch {
    // silent catch
  }

  if (!typescriptVersion) {
    throw new Error(
      'When you use TsCheckerRspackPlugin with typescript reporter enabled, you must install `typescript` package.'
    );
  }

  if (!fs.existsSync(config.configFile)) {
    throw new Error(
      [
        `Cannot find the "${config.configFile}" file.`,
        `Please check Rspack and TsCheckerRspackPlugin configuration.`,
        `Possible errors:`,
        '  - wrong `context` directory in Rspack configuration (if `configFile` is not set or is a relative path in the fork plugin configuration)',
        '  - wrong `typescript.configFile` path in the plugin configuration (should be a relative or absolute path)',
      ].join(os.EOL)
    );
  }
}

export { assertTypeScriptSupport };
