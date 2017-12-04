var path = require('path');
var webpack = require('webpack');
var CopyWebpackPlugin = require('copy-webpack-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');

module.exports = {
    entry: {
        index: 'src/js/modules/index.js',
        search: 'src/js/modules/search.js',
        submit: 'src/js/modules/submit.js',
        studies: 'src/js/modules/studies.js',
        study: 'src/js/modules/study.js',
        samples: 'src/js/modules/samples.js',
        sample: 'src/js/modules/sample.js',
        run: 'src/js/modules/run.js',
        compare: 'src/js/modules/compare.js',
        about: 'src/js/modules/about.js',
        help: 'src/js/modules/help.js',
        // biomes: 'src/js/modules/biomes.js',
        pipelines: 'src/js/modules/pipelines.js',
        pipeline: 'src/js/modules/pipeline.js',
    },
    output: {
        filename: '[name].js',
        path: __dirname + '/dist/js',
    },
    resolve: {
        modules: [__dirname, 'node_modules'],
        alias: {
            handlebars: 'handlebars/dist/handlebars.min.js',
        },
    },
    module: {
        loaders: [
            {
                test: /\.css$/,
                use: ['style-loader', 'css-loader']
            }, {
                test: /\.handlebars$/,
                loader: "handlebars-loader"
                // loader: __dirname + "/../../../",
                // query: {
                //     partialDirs: [
                //         path.join(__dirname + "../", 'templates', 'partials')
                //     ]
                // }
            }, {
                test: /\.(html)$/,
                use: {
                    loader: 'html-loader',
                    options: {
                        attrs: [':data-src']
                    }
                }
            }, {
                test: /(foundation\.core)/,
                loader: 'exports?foundation=jQuery.fn.foundation'
            },
        ],

        rules: [
            {
                test: /\.js$/,
                exclude: /(node_modules|bower_components)/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: ['env'],
                    }
                }
            }, {
                test: /\.handlebars$/,
                loader: "handlebars-loader"
            }, {
                test: /\.(html)$/,
                use: [
                    {
                        loader: 'file-loader',
                        options: {
                            name: '[name].[ext]',
                            outputPath: '../'
                        }
                    }
                ]
            }, {
                test: /\.css$/,
                use: [
                    'style-loader',
                    'css-loader'
                ]
            }, {
                test: /\.(png|woff|woff2|eot|ttf|svg)$/,
                loader: 'url-loader?limit=100000'
            }
// }, {
            //     test: /\.(jpe?g|png|gif|svg)$/i,
            //     loader: 'file-loader?name=../[path][name].[ext]!html-loader'
            // }
        ]
    },
    plugins: [
        new CleanWebpackPlugin(['dist']),
        new webpack.ProvidePlugin({
            $: 'jquery',
            jQuery: 'jquery',
            'window.jQuery': 'jquery'
        }),
        new CopyWebpackPlugin([
            {from: 'static/images', to: '../static/images'},
            {from: 'static/fonts', to: '../static/fonts'},
            {from: 'static/js', to: '../static/js'},
            {from: 'static/libraries', to: '../static/libraries'},
        ]),
    ],

    devtool: "#inline-source-map",
};