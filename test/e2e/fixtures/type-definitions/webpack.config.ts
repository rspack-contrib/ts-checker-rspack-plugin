import TsCheckerRspackPlugin from 'fork-ts-checker-webpack-plugin';

const config = {
  entry: './src/index.ts',
  plugins: [
    new TsCheckerRspackPlugin({
      async: 'invalid_value',
      typescript: {},
    }),
  ],
};
