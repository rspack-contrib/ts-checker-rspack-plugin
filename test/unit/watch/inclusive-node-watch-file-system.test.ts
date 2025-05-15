import { createIsIgnored } from '../../../src/watch/inclusive-node-watch-file-system';

describe('createIsIgnored', () => {
  const gitPath = '/path/to/.git/foo';
  const nodeModulesPath = '/path/to/node_modules/foo/dist/index.js';
  const distModulePath = '/path/to/dist/foo.js';
  const srcModulePath = '/path/to/src/foo.ts';

  it('should allow to passing RegExp to the first argument', () => {
    const isIgnored = createIsIgnored([/[\\/](?:\.git|node_modules)[\\/]/], []);
    expect(isIgnored(gitPath)).toBe(true);
    expect(isIgnored(nodeModulesPath)).toBe(true);
    expect(isIgnored(distModulePath)).toBe(false);
    expect(isIgnored(srcModulePath)).toBe(false);
  });

  it('should allow to passing string path to the first argument', () => {
    const isIgnored = createIsIgnored(['/path/to/.git'], []);
    expect(isIgnored(gitPath)).toBe(true);
    expect(isIgnored(nodeModulesPath)).toBe(false);
    expect(isIgnored(distModulePath)).toBe(false);
    expect(isIgnored(srcModulePath)).toBe(false);
  });

  it('should allow to passing string path to the second argument', () => {
    // exclude: ["dist"] in tsconfig.json
    const isIgnored = createIsIgnored([], ['/path/to/dist']);
    expect(isIgnored(gitPath)).toBe(true);
    expect(isIgnored(nodeModulesPath)).toBe(false);
    expect(isIgnored(distModulePath)).toBe(true);
    expect(isIgnored(srcModulePath)).toBe(false);
  });

  it('should allow to passing glob path to the second argument', () => {
    // exclude: ["dist/**"] in tsconfig.json
    const isIgnored1 = createIsIgnored([], ['/path/to/dist/**']);
    expect(isIgnored1(gitPath)).toBe(true);
    expect(isIgnored1(nodeModulesPath)).toBe(false);
    expect(isIgnored1(distModulePath)).toBe(true);
    expect(isIgnored1(srcModulePath)).toBe(false);

    // exclude: ["**/dist/**"] in tsconfig.json
    const isIgnored2 = createIsIgnored([], ['/path/to/**/dist/**']);
    expect(isIgnored2(gitPath)).toBe(true);
    expect(isIgnored2(nodeModulesPath)).toBe(true);
    expect(isIgnored2(distModulePath)).toBe(true);
    expect(isIgnored2(srcModulePath)).toBe(false);

    // exclude: ["**/dist/*"] in tsconfig.json
    const isIgnored3 = createIsIgnored([], ['/path/to/**/dist/*']);
    expect(isIgnored3(gitPath)).toBe(true);
    expect(isIgnored3(nodeModulesPath)).toBe(true);
    expect(isIgnored3(distModulePath)).toBe(true);
    expect(isIgnored3(srcModulePath)).toBe(false);
  });
});
