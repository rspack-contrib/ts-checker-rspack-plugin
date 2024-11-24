import { TsCheckerRspackPlugin } from 'src/plugin';

describe('plugin', () => {
  it('exposes current version', () => {
    expect(TsCheckerRspackPlugin.version).toEqual(require('../../package.json').version);
  });

  it("doesn't throw an error for empty options", () => {
    expect(() => new TsCheckerRspackPlugin()).not.toThrowError();
  });

  it('accepts a custom logger', () => {
    const logger = {
      error: (message) => console.log(message),
      log: (message) => console.log(message),
    };

    expect(() => new TsCheckerRspackPlugin({ logger })).not.toThrowError();
  });
});
