import * as CleanWebpackPlugin from 'clean-webpack-plugin';
import * as ForkCheckerPlugin from 'fork-ts-checker-webpack-plugin';
import * as HtmlWebpackPlugin from 'html-webpack-plugin';
import * as ExtractTextPlugin from 'extract-text-webpack-plugin';
import * as path from 'path';
import * as webpack from 'webpack';


function rootPath(...paths: string[]) {
  return path.resolve(__dirname, ...paths);
}

function srcPath(...paths: string[]) {
  return path.resolve(__dirname, 'src', ...paths);
}

function demoPath(...paths: string[]) {
  return path.resolve(__dirname, 'demo', ...paths);
}

function distPath(...paths: string[]) {
  return path.resolve(__dirname, 'dist', ...paths);
}


module.exports = function(env?: { [k: string]: any }): webpack.Configuration {
  const isDemo = !!(env && env.demo);
  const tsConfigFile = rootPath('tsconfig.json');

  return {
    context: srcPath(),
    entry: isDemo ? demoPath('main.ts') : srcPath('ql-editor.module.ts'),
    target: 'node',
    // devtool: 'source-map',
    output: {
      path: distPath(),
      filename: 'query-language-editor.js',
      library: 'query-language-editor',
      libraryTarget: 'umd',
    },
    module: {
      rules: [
        // {
        //   test: /\.tsx?$/,
        //   enforce: 'pre',
        //   loader: 'tslint-loader',
        //   options: {
        //     tsConfigFile,
        //     typeCheck: true,
        //   },
        // },
        {
          test: /\.tsx?$/,
          use: [
            {
              loader: 'ts-loader',
              options: {
                transpileOnly: true,
                configFile: tsConfigFile,
                silent: true,
              }
            },
            'angular2-template-loader',
          ],
        },
        {
          test: /\.scss$/,
          oneOf: [
            {
              test: /\.component.scss$/,
              use: [
                'to-string-loader',
                {
                  loader: 'css-loader',
                  options: {
                    sourceMap: true,
                  }
                },
                {
                  loader: 'postcss-loader',
                  options: {
                    sourceMap: true,
                    plugins: [ require('autoprefixer') ],
                  },
                },
                {
                  loader: 'sass-loader',
                  options: {
                    sourceMap: true,
                  },
                },
              ],
            },
            {
              test: /$/,
              use: [
                {
                  loader: 'style-loader',
                  options: {
                    sourceMap: true,
                  }
                },
                {
                  loader: 'postcss-loader',
                  options: {
                    sourceMap: true,
                    plugins: [ require('autoprefixer') ],
                  },
                },
                {
                  loader: 'sass-loader',
                  options: {
                    sourceMap: true,
                  },
                },
              ]
            }
          ],
        },
        {
          test: /\.css$/,
          use: [
            {
              loader: 'style-loader',
              options: {
                sourceMap: true,
              }
            },
            {
              loader: 'css-loader',
              options: {
                sourceMap: true,
              }
            },
            {
              loader: 'postcss-loader',
              options: {
                sourceMap: true,
                plugins: [ require('autoprefixer') ],
              },
            },
          ]
        },
        {
          test: /\.html$/,
          use: {
            loader: 'html-loader',
            options: {
              attrs: [ 'img:src', 'link:href' ],
            }
          },
        },
        {
          test: /\.(ico|png|jpeg|jpg|gif)$/,
          use: {
            loader: 'file-loader',
            options: {
              name: '/[path][name].[ext]',
            },
          },
        }
      ]
    },
    resolve: {
      extensions: ['.ts', '.js', '.json', '*'],
    },
    plugins: [
      new ForkCheckerPlugin({
        tsconfig: tsConfigFile,
        watch: srcPath(),
        silent: true,
      }),
      new webpack.WatchIgnorePlugin([
        new RegExp(`^(?!(${srcPath()}|${demoPath()})).*$`),
      ]),
      // new webpack.ProvidePlugin({
      //   'jQuery': 'jquery',
      //   '$': 'jquery',
      //   'window.jQuery': 'jquery',
      //   'Tether': 'tether',
      // }),
      new webpack.ContextReplacementPlugin(
        /angular[\\/]core[\\/]/,
        __dirname
      ),
      new HtmlWebpackPlugin({
        filename: distPath('index.html'),
        template: demoPath('index.html'),
        env,
      }),
      new CleanWebpackPlugin(distPath(), {
        verbose: false,
        watch: false
      }),
      new ExtractTextPlugin('[name].css'),
      // new webpack.optimize.UglifyJsPlugin({
      //   sourceMap: true,
      // }),
      // new LiveReloadPlugin({
      //   appendScriptTag: true,
      // }),
    ],
    stats: {
      version: false,
      hash: false,
      children: false,
      maxModules: 0,
      chunks: false,
    },
  };
};
