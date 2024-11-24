const path = require('path');
const TsCheckerRspackPlugin = require('fork-ts-checker-webpack-plugin');

module.exports = {
  entry: './src/index.ts',
  output: {
    filename: 'index.js',
    path: path.resolve(__dirname, 'dist'),
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        loader: 'ts-loader',
        exclude: /node_modules/,
        options: {
          transpileOnly: true,
        },
      },
    ],
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
  },
  plugins: [
    new TsCheckerRspackPlugin({
      async: false,
    }),
  ],
  infrastructureLogging: {
    level: 'log',
    debug: /TsCheckerRspackPlugin/,
  },
};
