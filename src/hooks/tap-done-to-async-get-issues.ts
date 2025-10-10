import pc from 'picocolors';
import type * as rspack from '@rspack/core';

import { statsFormatter } from '../formatter/stats-formatter';
import { createWebpackFormatter } from '../formatter/webpack-formatter';
import { getInfrastructureLogger } from '../infrastructure-logger';
import type { Issue } from '../issue';
import { IssueWebpackError } from '../issue/issue-webpack-error';
import type { TsCheckerRspackPluginConfig } from '../plugin-config';
import { getPluginHooks } from '../plugin-hooks';
import type { TsCheckerRspackPluginState } from '../plugin-state';
import { isPending } from '../utils/async/is-pending';
import { wait } from '../utils/async/wait';

function tapDoneToAsyncGetIssues(
  compiler: rspack.Compiler,
  config: TsCheckerRspackPluginConfig,
  state: TsCheckerRspackPluginState
) {
  const hooks = getPluginHooks(compiler);
  const { debug } = getInfrastructureLogger(compiler);

  compiler.hooks.done.tap('TsCheckerRspackPlugin', async (stats) => {
    if (stats.compilation.compiler !== compiler) {
      // run only for the compiler that the plugin was registered for
      return;
    }

    const issuesPromise = state.issuesPromise;
    let issues: Issue[] | undefined;

    try {
      if (await isPending(issuesPromise)) {
        hooks.waiting.call(stats.compilation);
        config.logger.log(pc.cyan('[type-check] in progress...'));
      } else {
        // wait 10ms to log issues after webpack stats
        await wait(10);
      }

      issues = await issuesPromise;
    } catch (error) {
      hooks.error.call(error, stats.compilation);
      return;
    }

    if (
      !issues || // some error has been thrown
      state.issuesPromise !== issuesPromise // we have a new request - don't show results for the old one
    ) {
      return;
    }

    debug(`Got ${issues?.length || 0} issues from getIssuesWorker.`);

    // filter list of issues by provided issue predicate
    issues = issues.filter(config.issue.predicate);

    // modify list of issues in the plugin hooks
    issues = hooks.issues.call(issues, stats.compilation);

    const formatter = createWebpackFormatter(config.formatter.format, config.formatter.pathType);

    if (issues.length) {
      // follow webpack's approach - one process.write to stderr with all errors and warnings
      config.logger.error(issues.map((issue) => formatter(issue)).join('\n'));
    }

    // print stats of the compilation
    config.logger.log(statsFormatter(issues, stats));

    // report issues to dev-server (overlay), if it's listening
    // skip reporting if there are no issues, to avoid an extra hot reload
    if (issues.length && state.DevServerDoneTap) {
      issues.forEach((issue) => {
        const error = new IssueWebpackError(
          config.formatter.format(issue),
          config.formatter.pathType,
          issue
        );

        if (issue.severity === 'warning') {
          stats.compilation.warnings.push(error);
        } else {
          stats.compilation.errors.push(error);
        }
      });

      debug('Sending issues to the dev-server.');
      state.DevServerDoneTap.fn(stats);
    }
  });
}

export { tapDoneToAsyncGetIssues };
