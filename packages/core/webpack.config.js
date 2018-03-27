const webpack = require('webpack');
const path = require('path');
const { partial } = require('lodash');
const CleanWebpackPlugin = require('clean-webpack-plugin');

const srcPath = partial(path.resolve, __dirname, 'src');
const distPath = partial(path.resolve, __dirname, 'dist');

module.exports = (env = {}) => {
  const production = !!env.production;
  return {
    context: srcPath(),
    devtool: 'source-map',
    entry: './qlang.ts',
    output: {
      path: distPath(),
      filename: 'qlang.js',
      library: 'qlang',
      libraryTarget: 'umd',
    },
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
        new webpack.optimize.UglifyJSPlugin({
          sourceMap: true,
        }),
      ]: []),
  }
};
