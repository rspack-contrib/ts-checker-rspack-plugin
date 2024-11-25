import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { expect, test } from '@playwright/test';
import { createRsbuild } from '@rsbuild/core';
import { TsCheckerRspackPlugin } from '../../../lib';
import { getRandomPort, proxyConsole } from '../helper';

const __dirname = dirname(fileURLToPath(import.meta.url));

test('should throw error when exist type errors', async () => {
  const { logs, restore } = proxyConsole();

  const rsbuild = await createRsbuild({
    cwd: __dirname,
    rsbuildConfig: {
      tools: {
        rspack: {
          plugins: [new TsCheckerRspackPlugin()],
        },
      },
    },
  });

  await expect(rsbuild.build()).rejects.toThrowError('build failed!');

  expect(logs.find((log) => log.includes('File:') && log.includes('/src/index.ts'))).toBeTruthy();

  expect(
    logs.find((log) =>
      log.includes(`Argument of type 'string' is not assignable to parameter of type 'number'.`)
    )
  ).toBeTruthy();

  restore();
});

test('should throw error when exist type errors in dev mode', async ({ page }) => {
  const { logs, restore } = proxyConsole();

  const rsbuild = await createRsbuild({
    cwd: __dirname,
    rsbuildConfig: {
      tools: {
        rspack: {
          plugins: [
            new TsCheckerRspackPlugin({
              async: false,
            }),
          ],
        },
      },
      server: {
        port: getRandomPort(),
      },
    },
  });

  const { server, urls } = await rsbuild.startDevServer();

  await page.goto(urls[0]);

  expect(logs.find((log) => log.includes('File:') && log.includes('/src/index.ts'))).toBeTruthy();

  expect(
    logs.find((log) =>
      log.includes(`Argument of type 'string' is not assignable to parameter of type 'number'.`)
    )
  ).toBeTruthy();

  restore();
  await server.close();
});

test('should not throw error when the file is excluded', async () => {
  const rsbuild = await createRsbuild({
    cwd: __dirname,
    rsbuildConfig: {
      tools: {
        rspack: {
          plugins: [
            new TsCheckerRspackPlugin({
              issue: {
                exclude: [{ file: '**/index.ts' }],
              },
            }),
          ],
        },
      },
    },
  });

  await expect(rsbuild.build()).resolves.toBeTruthy();
});

test('should not throw error when the file is excluded by code', async () => {
  const rsbuild = await createRsbuild({
    cwd: __dirname,
    rsbuildConfig: {
      tools: {
        rspack: {
          plugins: [
            new TsCheckerRspackPlugin({
              issue: {
                exclude: [{ code: 'TS2345' }],
              },
            }),
          ],
        },
      },
    },
  });

  await expect(rsbuild.build()).resolves.toBeTruthy();
});