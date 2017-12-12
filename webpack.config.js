const webpack = require('webpack');
const path = require('path');
const UglifyJSPlugin = require('uglifyjs-webpack-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');

module.exports = env => {
  let production = !!(env && env.production);
  return {
    context: path.resolve(__dirname, 'src'),
    devtool: 'source-map',
    entry: './qlang.ts',
    output: {
      path: path.resolve(__dirname, 'dist'),
      filename: 'qlang.js',
      library: 'qlang',
      libraryTarget: 'umd',
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
    resolve: {
      modules: [
        'node_modules',
      ],
      extensions: ['.ts', '.js', '.json', '*'],
    },
    plugins: [
      new CleanWebpackPlugin(path.resolve(__dirname, 'dist'), {
        verbose: false,
        watch: false
      }),
    ]
      .concat(production ? [
        new UglifyJSPlugin({
          sourceMap: true,
        }),
      ]: []),
  }
};
