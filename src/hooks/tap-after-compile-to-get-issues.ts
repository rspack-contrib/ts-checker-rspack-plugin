import type * as rspack from '@rspack/core';

import { getInfrastructureLogger } from '../infrastructure-logger';
import type { Issue } from '../issue';
import { IssueWebpackError } from '../issue/issue-webpack-error';
import type { TsCheckerRspackPluginConfig } from '../plugin-config';
import { getPluginHooks } from '../plugin-hooks';
import type { TsCheckerRspackPluginState } from '../plugin-state';

function tapAfterCompileToGetIssues(
  compiler: rspack.Compiler,
  config: TsCheckerRspackPluginConfig,
  state: TsCheckerRspackPluginState
) {
  const hooks = getPluginHooks(compiler);
  const { debug } = getInfrastructureLogger(compiler);

  compiler.hooks.afterCompile.tapPromise('TsCheckerRspackPlugin', async (compilation) => {
    if (compilation.compiler !== compiler) {
      // run only for the compiler that the plugin was registered for
      return;
    }

    let issues: Issue[] | undefined = [];

    try {
      issues = await state.issuesPromise;
    } catch (error) {
      hooks.error.call(error, compilation);
      return;
    }

    debug('Got issues from getIssuesWorker.', issues?.length);

    if (!issues) {
      // some error has been thrown or it was canceled
      return;
    }

    // filter list of issues by provided issue predicate
    issues = issues.filter(config.issue.predicate);

    // modify list of issues in the plugin hooks
    issues = hooks.issues.call(issues, compilation);

    issues.forEach((issue) => {
      const error = new IssueWebpackError(
        config.formatter.format(issue),
        config.formatter.pathType,
        issue
      );

      if (issue.severity === 'warning') {
        compilation.warnings.push(error);
      } else {
        compilation.errors.push(error);
      }
    });
  });
}

export { tapAfterCompileToGetIssues };
