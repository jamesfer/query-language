const webpack = require('webpack');
const path = require('path');

module.exports = {
  context: path.resolve(__dirname, 'src'),
  entry: './index.ts',
  target: 'web',
  output: {
    publicPath: 'build',
    path: path.resolve(__dirname, 'build'),
    filename: 'index.js',
    library: 'qlang',
  },
  module: {
    rules: [{
      test: /\.tsx?$/,
      use: {
        loader: 'awesome-typescript-loader',
        options: {
          silent: true,
          sourceMap: true,
        },
      },
      exclude: [ /node_modules/ ],
    }],
  },
  resolve: {
    modules: [
      'node_modules',
    ],
    extensions: ['.ts', '.js', '.json', '*'],
  },
  devtool: 'source',
};
