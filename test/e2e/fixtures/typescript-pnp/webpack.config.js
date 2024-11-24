const path = require('path');
const PnpWebpackPlugin = require('pnp-webpack-plugin');
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
        options: PnpWebpackPlugin.tsLoaderOptions({
          transpileOnly: true,
        }),
      },
    ],
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
    plugins: [PnpWebpackPlugin],
  },
  resolveLoader: {
    plugins: [PnpWebpackPlugin.moduleLoader(module)],
  },
  plugins: [
    new TsCheckerRspackPlugin({
      async: false,
    }),
  ],
  infrastructureLogging: {
    level: 'log',
  },
};
