const webpack = require('webpack');
const path = require('path');

const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');

module.exports = function (env, options) {
  const isEnvProduction = options.mode === 'production';
  return {
    mode: isEnvProduction ? 'production' : 'development',
    entry: './src/index.tsx',
    devtool: isEnvProduction ? 'source-map' : 'inline-source-map',
    devServer: {
      port: 9000,
      hot: true,
      static: {
        directory: path.join(__dirname, 'dist'),
        publicPath: '/metagenomics',
      },
      historyApiFallback: {
        rewrites: [
          {
            from: /.*(\/(?:js|css|static)\/.+)$/,
            to: (context) => context.match[1],
          },
        ],
      },
    },
    module: {
      rules: [
        {
          test: /\.tsx?$/,
          use: 'ts-loader',
          exclude: /node_modules/,
        },
        {
          test: /\.css$/,
          use: [
            isEnvProduction ? MiniCssExtractPlugin.loader : 'style-loader',
            'css-loader',
          ],
        },
        {
          test: /\.(png|jp(e*)g|svg|gif)$/,
          type: 'asset/resource',
          generator: {
            filename: 'static/[hash][ext][query]',
          },
        },
      ],
    },
    resolve: {
      extensions: ['.tsx', '.ts', '.js'],
      modules: [
        path.resolve(__dirname),
        path.resolve(__dirname, 'src'),
        path.resolve(__dirname, 'public'),
        'node_modules',
      ],
    },
    output: {
      filename: 'mgnify_bundle.js',
      path: path.resolve(__dirname, 'dist'),
      filename: isEnvProduction
        ? 'js/[name].[contenthash:8].js'
        : 'js/bundle.js',
      chunkFilename: isEnvProduction
        ? 'js/[name].[contenthash:8].chunk.js'
        : 'js/[name].chunk.js',
    },
    plugins: [
      new HtmlWebpackPlugin({
        template: path.resolve(__dirname, 'public', 'index.html'),
        title: 'MGnify - EBI',
      }),
      isEnvProduction &&
        new MiniCssExtractPlugin({
          filename: 'css/[name].[contenthash:8].css',
          chunkFilename: 'css/[name].[contenthash:8].chunk.css',
        }),
      new CleanWebpackPlugin(),
    ].filter(Boolean),
    optimization: {
      minimize: isEnvProduction,
      minimizer: [
        // For webpack@5 you can use the `...` syntax to extend existing minimizers (i.e. `terser-webpack-plugin`), uncomment the next line
        `...`,
        new CssMinimizerPlugin(),
      ],
    },
  };
};