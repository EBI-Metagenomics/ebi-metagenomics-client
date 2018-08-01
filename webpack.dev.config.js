const ExtractTextPlugin = require('extract-text-webpack-plugin');

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
    optimization: {
        splitChunks: {
            chunks: 'async',
            minSize: 1000,
            minChunks: 3,
            maxAsyncRequests: 5,
            maxInitialRequests: 3
            // cacheGroups: {
            //     commons: {
            //         name: 'common',
            //         chunks: 'all',
            //         minChunks: 2
            //     }
            // }
        },
        noEmitOnErrors: true, // NoEmitOnErrorsPlugin
        concatenateModules: true // ModuleConcatenationPlugin
    },
    devtool: '#inline-source-map',
    node: baseConfig.node
};

