import TsCheckerRspackPlugin from 'ts-checker-rspack-plugin';

const config = {
  entry: './src/index.ts',
  plugins: [
    new TsCheckerRspackPlugin({
      async: 'invalid_value',
      typescript: {},
    }),
  ],
};
