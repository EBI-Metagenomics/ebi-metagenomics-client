const webpack = require('webpack');
const path = require('path');

const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const SentryCliPlugin = require('@sentry/webpack-plugin');

let config = {};
try {
  const publicConfig = require('./config.json');
  config = publicConfig;
} catch {
  console.warn("Couldn't load the public config");
}
try {
  const privateConfig = require('./config.private.json');
  config = { ...config, ...privateConfig };
} catch {
  console.log("Couldn't load the private config");
}

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
        publicPath: config.basename || '/metagenomics',
      },
      historyApiFallback: {
        rewrites: [
          {
            from: /.*(\/(?:js|css|static)\/.+)$/,
            to: (context) => context.match[1],
          },
          {
            from: /.*(\/(?!json)\/.+)$/, // Excluding json from the fallback for HRM to work
            to: '/index.html',
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
        {
          test: /\.(txt|fa|fasta)$/,
          type: 'asset/source',
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
      new CopyPlugin({
        patterns: [
          { from: path.resolve(__dirname, 'public', '404.html'), to: '.' },
          {
            from: '*.{js,map,wasm}',
            context: path.resolve(
              __dirname,
              'node_modules/mgnify-sourmash-component/dist/'
            ),
            to: 'js/',
          },
        ],
      }),
      isEnvProduction &&
        new SentryCliPlugin({
          include: '.',
          project: 'embl-ebi-4r',
          org: 'embl-ebi-mit',
          ignoreFile: '.sentrycliignore',
          ignore: ['node_modules', 'webpack.config.js'],
          configFile: 'sentry.properties',
          authToken: process.env.SENTRY_AUTH_TOKEN,
          deploy: {
            env: config.sentryEnv,
          },
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
