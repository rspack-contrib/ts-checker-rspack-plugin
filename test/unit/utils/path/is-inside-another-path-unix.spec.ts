import { isInsideAnotherPath } from '../../../../src/utils/path/is-inside-another-path';

const mockedPath = rs.hoisted(() => {
  const path = rs.requireActual('node:path');
  return path.posix;
});

rs.mock('node:path', () => mockedPath);

const unixTests: [string, string, boolean][] = [
  // Identical
  ['/foo', '/foo', false],
  // Nothing in common
  ['/foo', '/bar', false],
  // subfolder
  ['/foo', '/foo/bar', true],
  // parallel
  ['/foo', '/foo/../bar', false],
  // relative subfolder
  ['/foo', '/foo/./bar', true],
];

describe('Properly detects ignored sub-folders on Unix', () => {
  it('should work on Unix', () => {
    unixTests.forEach(([parent, testedPath, expectedResult]) => {
      const result = isInsideAnotherPath(parent, testedPath);
      expect(result).toEqual(expectedResult);
    });
  });
});
