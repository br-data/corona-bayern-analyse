const Webpack = require('webpack');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const { merge } = require('webpack-merge');
const common = require('./webpack.common.js');

module.exports = merge(common, {
  mode: 'production',
  devtool: false,
  stats: 'errors-warnings',
  bail: true,
  output: {
    filename: 'js/[name].js',
    chunkFilename: 'js/[name].chunk.js'
  },
  plugins: [
    new CleanWebpackPlugin(),
    new Webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify('production')
    }),
    new Webpack.optimize.ModuleConcatenationPlugin(),
    new MiniCssExtractPlugin({
      filename: 'css/bundle.css'
    })
  ],
  module: {
    rules: [
      {
        test: /\.(js)$/,
        exclude: /node_modules/,
        use: 'babel-loader'
      },
      {
        test: /\.s?css/i,
        use : [
          {
            loader: MiniCssExtractPlugin.loader,
            options: {
              publicPath: '../'
            }
          },
          {
            loader: 'css-loader',
            options: {
              importLoaders: 1
            }
          },
          {
            loader: 'postcss-loader',
            options: {
              ident: 'postcss',
              plugins: () => [
                require('postcss-preset-env')(),
                require('cssnano')(),
                require('autoprefixer')()
              ]
            }
          },
          {
            loader: 'sass-loader',
            options: {
              implementation: require('sass')
            }
          }
        ]
      }
    ]
  }
});
