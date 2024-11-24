import type { AbortController } from 'node-abort-controller';
import type { FullTap } from 'tapable';

import type { FilesChange } from './files-change';
import type { FilesMatch } from './files-match';
import type { Issue } from './issue';

interface TsCheckerRspackPluginState {
  issuesPromise: Promise<Issue[] | undefined>;
  dependenciesPromise: Promise<FilesMatch | undefined>;
  abortController: AbortController | undefined;
  aggregatedFilesChange: FilesChange | undefined;
  lastDependencies: FilesMatch | undefined;
  watching: boolean;
  initialized: boolean;
  iteration: number;
  webpackDevServerDoneTap: FullTap | undefined;
}

function createPluginState(): TsCheckerRspackPluginState {
  return {
    issuesPromise: Promise.resolve(undefined),
    dependenciesPromise: Promise.resolve(undefined),
    abortController: undefined,
    aggregatedFilesChange: undefined,
    lastDependencies: undefined,
    watching: false,
    initialized: false,
    iteration: 0,
    webpackDevServerDoneTap: undefined,
  };
}

export { TsCheckerRspackPluginState, createPluginState };
