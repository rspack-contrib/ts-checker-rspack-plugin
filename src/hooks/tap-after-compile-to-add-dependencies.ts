import type * as webpack from 'webpack';

import { getInfrastructureLogger } from '../infrastructure-logger';
import type { TsCheckerRspackPluginConfig } from '../plugin-config';
import type { TsCheckerRspackPluginState } from '../plugin-state';

function tapAfterCompileToAddDependencies(
  compiler: webpack.Compiler,
  config: TsCheckerRspackPluginConfig,
  state: TsCheckerRspackPluginState
) {
  const { debug } = getInfrastructureLogger(compiler);

  compiler.hooks.afterCompile.tapPromise('TsCheckerRspackPlugin', async (compilation) => {
    if (compilation.compiler !== compiler) {
      // run only for the compiler that the plugin was registered for
      return;
    }

    const dependencies = await state.dependenciesPromise;

    debug(`Got dependencies from the getDependenciesWorker.`, dependencies);
    if (dependencies) {
      state.lastDependencies = dependencies;

      dependencies.files.forEach((file) => {
        compilation.fileDependencies.add(file);
      });
    }
  });
}

export { tapAfterCompileToAddDependencies };
