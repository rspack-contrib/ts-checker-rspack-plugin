import { isInsideAnotherPath } from '../../../../src/utils/path/is-inside-another-path';

// fixed https://github.com/web-infra-dev/rstest/issues/785
const mockedPath = rs.hoisted(() => {
  const path = rs.requireActual('node:path');
  return path.win32;
});

rs.mock('node:path', () => mockedPath);

const windowsTests: [string, string, boolean][] = [
  // subfolder
  ['C:\\Foo', 'C:\\Foo\\Bar', true],
  // Nothing in common
  ['C:\\Foo', 'C:\\Bar', false],
  // Wrong drive.
  ['C:\\Foo', 'D:\\Foo\\Bar', false],
];

describe('Properly detects ignored sub-folders on Windows', () => {
  it('should work on Windows', () => {
    windowsTests.forEach(([parent, testedPath, expectedResult]) => {
      const result = isInsideAnotherPath(parent, testedPath);
      expect(result).toEqual(expectedResult);
    });
  });
});
