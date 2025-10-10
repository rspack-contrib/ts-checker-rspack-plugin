import pc from 'picocolors';
import type { Stats } from '@rspack/core';

import type { Issue } from '../issue';

// mimics Rspack's stats summary formatter
export function statsFormatter(issues: Issue[], stats: Stats): string {
  const errorsNumber = issues.filter((issue) => issue.severity === 'error').length;
  const warningsNumber = issues.filter((issue) => issue.severity === 'warning').length;
  const errorsFormatted = errorsNumber
    ? pc.bold(pc.red(`${errorsNumber} ${errorsNumber === 1 ? 'error' : 'errors'}`))
    : '';
  const warningsFormatted = warningsNumber
    ? pc.bold(pc.yellow(`${warningsNumber} ${warningsNumber === 1 ? 'warning' : 'warnings'}`))
    : '';
  const timeFormatted = stats.startTime ? Math.round(Date.now() - stats.startTime) : 0;

  if (!errorsFormatted && !warningsFormatted) {
    return pc.green(`[type-check] no errors found in ${timeFormatted} ms`);
  }

  return [
    '[type-check] found ',
    errorsFormatted,
    errorsFormatted && warningsFormatted ? ' and ' : '',
    warningsFormatted,
    timeFormatted ? ` in ${timeFormatted} ms` : '',
  ].join('');
}
