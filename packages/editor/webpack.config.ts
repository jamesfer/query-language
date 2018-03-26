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


module.exports = (): webpack.Configuration => {
  const tsConfigFile = rootPath('tsconfig.json');
  return {
    context: srcPath(),
    entry: srcPath('ql-editor.module.ts'),
    target: 'web',
    devtool: 'cheap-eval-source-map',
    output: {
      path: distPath(),
      filename: 'query-language-editor.js',
      library: 'query-language-editor',
      libraryTarget: 'umd',
    },
    stats: {
      version: false,
      hash: false,
      children: false,
      maxModules: 0,
      chunks: false,
    },
    resolve: {
      extensions: ['.ts', '.js', '.json', '*'],
    },
    module: {
      rules: [
        {
          test: /\.tsx?$/,
          use: [
            {
              loader: 'ts-loader',
              options: {
                configFile: tsConfigFile,
                // transpileOnly: true,
                // silent: true,
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
    plugins: [
      // new ForkCheckerPlugin({
      //   tsconfig: tsConfigFile,
      //   watch: srcPath(),
      //   silent: true,
      // }),
      new webpack.ContextReplacementPlugin(
        /angular[\\/]core[\\/]/,
        __dirname
      ),
      new CleanWebpackPlugin(distPath(), {
        verbose: false,
        watch: false
      }),
      new ExtractTextPlugin('[name].css'),
    ],
  };
};
