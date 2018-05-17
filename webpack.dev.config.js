const ExtractTextPlugin = require('extract-text-webpack-plugin');
// const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

const baseConfig = require('./webpack.base.config');

module.exports = {
    mode: 'development',
    plugins: baseConfig.plugins, // filter out empty values
    entry: baseConfig.entry,
    output: baseConfig.output,
    resolve: baseConfig.resolve,
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /(node_modules|bower_components)/,
                use: {loader: 'istanbul-instrumenter-loader', query: {esModules: true}}
            }, {
                test: /\.css$/,
                use: ExtractTextPlugin.extract({
                    fallback: 'style-loader',
                    use: [{loader: 'css-loader', options: {minimize: true, sourceMap: true}}]
                })
            }].concat(baseConfig.module.rules)
    },
    devtool: '#inline-source-map',
    node: baseConfig.node
};

