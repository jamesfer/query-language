import * as CleanWebpackPlugin from 'clean-webpack-plugin';
import * as HtmlWebpackPlugin from 'html-webpack-plugin';
import * as ExtractTextPlugin from 'extract-text-webpack-plugin';
import * as CompressionPlugin from 'compression-webpack-plugin';
import * as path from 'path';
import * as webpack from 'webpack';

function rootPath(...paths: string[]) {
  return path.resolve(__dirname, ...paths);
}

function srcPath(...paths: string[]) {
  return path.resolve(__dirname, 'src', ...paths);
}

function distPath(...paths: string[]) {
  return path.resolve(__dirname, 'dist', ...paths);
}

module.exports = (env?: Record<string, any>): webpack.Configuration => {
  env = env || {};
  return {
    context: srcPath(),
    entry: srcPath('main.ts'),
    target: 'web',
    devtool: env.optimize ? false : 'cheap-eval-source-map',
    output: {
      path: distPath(),
      filename: 'query-language-demo.js',
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
              use: ExtractTextPlugin.extract({
                fallback: [
                  {
                    loader: 'style-loader',
                    options: {
                      sourceMap: true,
                    },
                  }
                ],
                use: [
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
              }),
            },
          ],
        },
        {
          test: /\.css$/,
          use: ExtractTextPlugin.extract({
            fallback: [
              {
                loader: 'style-loader',
                options: {
                  sourceMap: true,
                },
              }
            ],
            use: [
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
          }),
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
              name: '[path][name].[ext]',
            },
          },
        }
      ]
    },
    plugins: [
      new webpack.WatchIgnorePlugin([ new RegExp(`^(?!${srcPath()}).*$`) ]),
      new webpack.ContextReplacementPlugin(/angular[\\/]core[\\/]/, __dirname),
      new ExtractTextPlugin('[name].css'),
      new HtmlWebpackPlugin({
        filename: distPath('index.html'),
        template: srcPath('index.html'),
      }),
      new CleanWebpackPlugin(distPath(), {
        verbose: false,
        watch: false,
      }),
    ],
  };
};
