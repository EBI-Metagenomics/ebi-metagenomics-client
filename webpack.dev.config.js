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
        },
        noEmitOnErrors: true, // NoEmitOnErrorsPlugin
        concatenateModules: true // ModuleConcatenationPlugin
    },
    devtool: '#inline-source-map',
    node: baseConfig.node,
    devServer: {
        port: 9000,
        proxy: {
            '/metagenomics/api': {
                target: 'http://localhost:8000/',
                secure: false,
                changeOrigin: true,
                pathRewrite: {
                    '^/metagenomics/api/latest': '/v1',
                },
                headers: {
                    "Access-Control-Allow-Origin": "*",
                    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, PATCH, OPTIONS",
                    "Access-Control-Allow-Headers": "X-Requested-With, content-type, Authorization"
                },
            },
            '/metagenomics$': {
                target: 'http://localhost:9000/',
                pathRewrite: {
                    '^/metagenomics$' : '/metagenomics/index.html',
                },
            },
            '/metagenomics/studies': {
                target: 'http://localhost:9000/',
                pathRewrite: {
                    '^/metagenomics/studies/.*$' : '/metagenomics/study.html',
                },
            },
            '/metagenomics/samples': {
                target: 'http://localhost:9000/',
                pathRewrite: {
                    '^/metagenomics/samples/.*$' : '/metagenomics/sample.html',
                },
            },
            '/metagenomics/analyses': {
                target: 'http://localhost:9000/',
                pathRewrite: {
                    '^/metagenomics/analyses/.*$' : '/metagenomics/analysis.html',
                },
            },
            '/metagenomics/search': {
                target: 'http://localhost:9000/',
                pathRewrite: {
                    '^/metagenomics/search' : '/metagenomics/search.html',
                },
            },
        }
    }
};
