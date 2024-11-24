import type * as rspack from '@rspack/core';

export interface InfrastructureLogger {
  log(...args: unknown[]): void;
  debug(...args: unknown[]): void;
  error(...args: unknown[]): void;
  warn(...args: unknown[]): void;
  info(...args: unknown[]): void;
}

export function getInfrastructureLogger(compiler: rspack.Compiler): InfrastructureLogger {
  const logger = compiler.getInfrastructureLogger('TsCheckerRspackPlugin');

  return {
    log: logger.log.bind(logger),
    debug: logger.debug.bind(logger),
    error: logger.error.bind(logger),
    warn: logger.warn.bind(logger),
    info: logger.info.bind(logger),
  };
}
