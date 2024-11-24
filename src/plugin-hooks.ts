import { SyncHook, SyncWaterfallHook, AsyncSeriesWaterfallHook } from 'tapable';
import type * as webpack from 'webpack';

import type { FilesChange } from './files-change';
import type { Issue } from './issue';

const compilerHookMap = new WeakMap<
  webpack.Compiler | webpack.MultiCompiler,
  TsCheckerRspackPluginHooks
>();

function createPluginHooks() {
  return {
    start: new AsyncSeriesWaterfallHook<[FilesChange, webpack.Compilation]>([
      'change',
      'compilation',
    ]),
    waiting: new SyncHook<[webpack.Compilation]>(['compilation']),
    canceled: new SyncHook<[webpack.Compilation]>(['compilation']),
    error: new SyncHook<[unknown, webpack.Compilation]>(['error', 'compilation']),
    issues: new SyncWaterfallHook<[Issue[], webpack.Compilation | undefined], void>([
      'issues',
      'compilation',
    ]),
  };
}

type TsCheckerRspackPluginHooks = ReturnType<typeof createPluginHooks>;

function forwardPluginHooks(
  source: TsCheckerRspackPluginHooks,
  target: TsCheckerRspackPluginHooks
) {
  source.start.tapPromise('TsCheckerRspackPlugin', target.start.promise);
  source.waiting.tap('TsCheckerRspackPlugin', target.waiting.call);
  source.canceled.tap('TsCheckerRspackPlugin', target.canceled.call);
  source.error.tap('TsCheckerRspackPlugin', target.error.call);
  source.issues.tap('TsCheckerRspackPlugin', target.issues.call);
}

function getPluginHooks(compiler: webpack.Compiler | webpack.MultiCompiler) {
  let hooks = compilerHookMap.get(compiler);
  if (hooks === undefined) {
    hooks = createPluginHooks();
    compilerHookMap.set(compiler, hooks);

    // proxy hooks for multi-compiler
    if ('compilers' in compiler) {
      compiler.compilers.forEach((childCompiler) => {
        const childHooks = getPluginHooks(childCompiler);

        if (hooks) {
          forwardPluginHooks(childHooks, hooks);
        }
      });
    }
  }
  return hooks;
}

export { getPluginHooks, TsCheckerRspackPluginHooks };
