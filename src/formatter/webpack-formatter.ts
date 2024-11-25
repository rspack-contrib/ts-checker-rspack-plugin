import os from 'os';
import path from 'path';

import pc from 'picocolors';

import { formatIssueLocation } from '../issue';
import { forwardSlash } from '../utils/path/forward-slash';
import { relativeToContext } from '../utils/path/relative-to-context';

import type { Formatter, FormatterPathType } from './formatter';

function createWebpackFormatter(formatter: Formatter, pathType: FormatterPathType): Formatter {
  // mimics webpack error formatter
  return function webpackFormatter(issue) {
    const color = issue.severity === 'warning' ? pc.yellow : pc.red;

    const severity = issue.severity.toUpperCase();

    if (issue.file) {
      let location = pc.bold(
        pathType === 'absolute'
          ? forwardSlash(path.resolve(issue.file))
          : relativeToContext(issue.file, process.cwd())
      );
      if (issue.location) {
        location += `:${pc.bold(pc.green(formatIssueLocation(issue.location)))}`;
      }

      return [`${pc.bold(color(severity))} in ${location}`, formatter(issue), ''].join(os.EOL);
    } else {
      return [`${pc.bold(color(severity))} in ` + formatter(issue), ''].join(os.EOL);
    }
  };
}

export { createWebpackFormatter };
