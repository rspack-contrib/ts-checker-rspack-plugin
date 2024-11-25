import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { expect, test } from '@playwright/test';
import { createRsbuild as baseCreateRsbuild, type CreateRsbuildOptions } from '@rsbuild/core';
import { webpackProvider } from '@rsbuild/webpack';
import { pluginSwc } from '@rsbuild/plugin-webpack-swc';
import { TsCheckerRspackPlugin } from '../../../lib';
import { getRandomPort, proxyConsole } from '../helper';

const __dirname = dirname(fileURLToPath(import.meta.url));

/**
 * Although this plugin is designed for Rspack, it can also be used in webpack in some cases.
 * So we need to test the webpack compatibility.
 */
const createRsbuild = async (config: CreateRsbuildOptions) => {
  const { rsbuildConfig = {} } = config;
  const { plugins = [] } = rsbuildConfig;
  return await baseCreateRsbuild({
    cwd: __dirname,
    rsbuildConfig: {
      ...rsbuildConfig,
      server: {
        ...rsbuildConfig.server,
        port: getRandomPort(),
      },
      tools: {
        ...rsbuildConfig.tools,
        // @ts-expect-error
        webpack: process.env.WEBPACK ? rsbuildConfig.tools?.rspack : undefined,
      },
      plugins: process.env.WEBPACK ? [pluginSwc(), ...plugins] : plugins,
      provider: process.env.WEBPACK ? webpackProvider : undefined,
    },
  });
};

test('should throw error when exist type errors', async () => {
  const { logs, restore } = proxyConsole();

  const rsbuild = await createRsbuild({
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
