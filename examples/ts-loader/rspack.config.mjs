import { TsCheckerRspackPlugin } from 'ts-checker-rspack-plugin';

export default {
  entry: './src/index.ts',
  resolve: {
    extensions: ['.ts', '.tsx', '.js'],
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        loader: 'ts-loader',
      },
    ],
  },
  plugins: [new TsCheckerRspackPlugin()],
};
