import type * as rspack from '@rspack/core';

import {
  clearFilesChange,
  consumeFilesChange,
  getFilesChange,
  updateFilesChange,
} from '../../src/files-change';

describe('files-change', () => {
  let compiler: rspack.Compiler;
  let otherCompiler: rspack.Compiler;

  beforeEach(() => {
    // compiler is used only as a key
    compiler = {} as unknown as rspack.Compiler;
    otherCompiler = {} as unknown as rspack.Compiler;
  });

  it('gets files change without modifying them', () => {
    updateFilesChange(compiler, { changedFiles: ['foo.ts'], deletedFiles: ['bar.ts'] });

    expect(getFilesChange(compiler)).toEqual({
      changedFiles: ['foo.ts'],
      deletedFiles: ['bar.ts'],
    });
    expect(getFilesChange(compiler)).toEqual({
      changedFiles: ['foo.ts'],
      deletedFiles: ['bar.ts'],
    });
  });

  it('aggregates changes', () => {
    updateFilesChange(compiler, { changedFiles: ['foo.ts', 'baz.ts'], deletedFiles: ['bar.ts'] });
    updateFilesChange(compiler, { changedFiles: ['bar.ts'], deletedFiles: [] });
    updateFilesChange(compiler, { changedFiles: [], deletedFiles: ['baz.ts'] });

    expect(getFilesChange(compiler)).toEqual({
      changedFiles: ['foo.ts', 'bar.ts'],
      deletedFiles: ['baz.ts'],
    });
  });

  it('clears changes', () => {
    updateFilesChange(compiler, { changedFiles: ['foo.ts', 'baz.ts'], deletedFiles: ['bar.ts'] });
    clearFilesChange(compiler);

    expect(getFilesChange(compiler)).toEqual({ changedFiles: [], deletedFiles: [] });
  });

  it('consumes changes', () => {
    updateFilesChange(compiler, { changedFiles: ['foo.ts', 'baz.ts'], deletedFiles: ['bar.ts'] });

    expect(consumeFilesChange(compiler)).toEqual({
      changedFiles: ['foo.ts', 'baz.ts'],
      deletedFiles: ['bar.ts'],
    });
    expect(getFilesChange(compiler)).toEqual({ changedFiles: [], deletedFiles: [] });
    expect(consumeFilesChange(compiler)).toEqual({ changedFiles: [], deletedFiles: [] });
  });

  it('keeps files changes data per compiler', () => {
    updateFilesChange(compiler, { changedFiles: ['foo.ts', 'baz.ts'], deletedFiles: ['bar.ts'] });

    expect(getFilesChange(otherCompiler)).toEqual({
      changedFiles: [],
      deletedFiles: [],
    });
    expect(consumeFilesChange(otherCompiler)).toEqual({
      changedFiles: [],
      deletedFiles: [],
    });
    expect(getFilesChange(compiler)).toEqual({
      changedFiles: ['foo.ts', 'baz.ts'],
      deletedFiles: ['bar.ts'],
    });
  });
});
