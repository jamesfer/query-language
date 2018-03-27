const webpack = require('webpack');
const path = require('path');
const { partial } = require('lodash');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const nodeExternals = require('webpack-node-externals');

const srcPath = partial(path.resolve, __dirname, 'src');
const distPath = partial(path.resolve, __dirname, 'dist');

module.exports = (env = {}) => {
  const production = !!env.production;
  return {
    context: srcPath(),
    devtool: 'source-map',
    entry: './qlang.ts',
    target: 'node',
    output: {
      path: distPath(),
      filename: 'qlang.js',
      library: 'qlang',
      libraryTarget: 'umd',
    },
    externals: [
      nodeExternals(),
    ],
    resolve: {
      extensions: ['.ts', '.js', '.json', '*'],
    },
    module: {
      rules: [{
        test: /\.tsx?$/,
        use: {
          loader: 'ts-loader',
          options: {
            compilerOptions: {
              declaration: production,
            }
          },
        },
        exclude: [ /node_modules/ ],
      }],
    },
    plugins: [
      new CleanWebpackPlugin(distPath(), {
        verbose: false,
        watch: false
      }),
    ]
      .concat(production ? [
        new webpack.optimize.UglifyJsPlugin({
          sourceMap: true,
        }),
      ]: []),
  }
};
