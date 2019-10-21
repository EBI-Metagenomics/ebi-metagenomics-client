const ExtractTextPlugin = require('extract-text-webpack-plugin');
// const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

const getCompressionPlugin = (() => {
    let plugin;
    return () => {
        if (!plugin) {
            plugin = require('compression-webpack-plugin');
        }
        return plugin;
    };
})();

const baseConfig = require('./webpack.base.config');

module.exports = {
    plugins: baseConfig.plugins.concat([
        // gzip compression
        new (getCompressionPlugin())({
            asset: '[path].gz[query]',
            test: /\.(js|css|html|svg)$/i,
            cache: true
        })
    ]), // filter out empty values
    entry: baseConfig.entry,
    output: baseConfig.output,
    resolve: baseConfig.resolve,
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /(node_modules|bower_components)/,
                use: {loader: 'babel-loader', options: {babelrc: true}}
            }, {
                test: /\.css$/,
                use: ExtractTextPlugin.extract({
                    fallback: 'style-loader',
                    use: [{loader: 'css-loader', options: {minimize: true, sourceMap: false}}]
                })
            }].concat(baseConfig.module.rules)
    },
    optimization: {
        namedModules: false, // NamedModulesPlugin()
        splitChunks: { // CommonsChunkPlugin()
            name: 'vendor',
            minChunks: 2
        },
        noEmitOnErrors: true, // NoEmitOnErrorsPlugin
        concatenateModules: true // ModuleConcatenationPlugin
    },
    node: baseConfig.node
};
