import * as path from 'path';

import type * as rspack from '@rspack/core';

import { tapAfterCompileToAddDependencies } from './hooks/tap-after-compile-to-add-dependencies';
import { tapAfterEnvironmentToPatchWatching } from './hooks/tap-after-environment-to-patch-watching';
import { tapErrorToLogMessage } from './hooks/tap-error-to-log-message';
import { tapStartToRunWorkers } from './hooks/tap-start-to-run-workers';
import { tapStopToTerminateWorkers } from './hooks/tap-stop-to-terminate-workers';
import { createPluginConfig } from './plugin-config';
import { getPluginHooks } from './plugin-hooks';
import type { TsCheckerRspackPluginOptions } from './plugin-options';
import { dependenciesPool, issuesPool } from './plugin-pools';
import { createPluginState } from './plugin-state';
import { createRpcWorker } from './rpc';
import { assertTypeScriptSupport } from './typescript/type-script-support';
import type { GetDependenciesWorker } from './typescript/worker/get-dependencies-worker';
import type { GetIssuesWorker } from './typescript/worker/get-issues-worker';
import { readFileSync } from 'node:fs';

const pkgJson = JSON.parse(readFileSync(path.join(__dirname, '../package.json'), 'utf-8'));

class TsCheckerRspackPlugin {
  /**
   * Current version of the plugin
   */
  static readonly version: string = pkgJson.version;
  /**
   * Default pools for the plugin concurrency limit
   */
  static readonly issuesPool = issuesPool;
  static readonly dependenciesPool = dependenciesPool;

  /**
   * @deprecated Use TsCheckerRspackPlugin.issuesPool instead
   */
  static readonly pool = issuesPool;

  private readonly options: TsCheckerRspackPluginOptions;

  constructor(options: TsCheckerRspackPluginOptions = {}) {
    this.options = options;
  }

  public static getCompilerHooks(compiler: rspack.Compiler) {
    return getPluginHooks(compiler);
  }

  apply(compiler: rspack.Compiler) {
    const config = createPluginConfig(compiler, this.options);
    const state = createPluginState();

    assertTypeScriptSupport(config.typescript);
    const getIssuesWorker = createRpcWorker<GetIssuesWorker>(
      path.resolve(__dirname, './typescript/worker/get-issues-worker.js'),
      config.typescript,
      config.typescript.memoryLimit
    );
    const getDependenciesWorker = createRpcWorker<GetDependenciesWorker>(
      path.resolve(__dirname, './typescript/worker/get-dependencies-worker.js'),
      config.typescript
    );

    tapAfterEnvironmentToPatchWatching(compiler, state);
    tapStartToRunWorkers(compiler, getIssuesWorker, getDependenciesWorker, config, state);
    tapAfterCompileToAddDependencies(compiler, config, state);
    tapStopToTerminateWorkers(compiler, getIssuesWorker, getDependenciesWorker, state);
    tapErrorToLogMessage(compiler, config);
  }
}

export { TsCheckerRspackPlugin };
