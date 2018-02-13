var path = require('path');
var webpack = require('webpack');
var CopyWebpackPlugin = require('copy-webpack-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');

const getCompressionPlugin = (() => {
    let plugin;
    return () => {
        if (!plugin) plugin = require('compression-webpack-plugin');
        return plugin;
    };
})();


module.exports = (env = {prod: false}) => {
    console.log('Production: ', env.prod);

    const config = {
        plugins: [
            new webpack.EnvironmentPlugin(
                ["API_URL", "SEARCH_URL", "INTERPRO_URL", "SEQUENCE_SEARCH_URL", "ENA_URL", "DEPLOYMENT_SUBFOLDER"]
            ),
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
            // GZIP compression
            env.prod ? new (getCompressionPlugin())({
                    asset: '[path].gz[query]',
                    test: /\.(js|css|html|svg)$/i,
                    cache: true,
                    algorithm(buffer, options, callback) {
                        require('node-zopfli').gzip(buffer, options, callback);
                    },
                })
                : null,
            // // Brotli compression
            // env.production
            //     ? new (getCompressionPlugin())({
            //         asset: '[path].br[query]',
            //         test: /\.(js|css|html|svg)$/i,
            //         cache: true,
            //         algorithm(buffer, _, callback) {
            //             require('iltorb').compress(
            //                 buffer,
            //                 {
            //                     mode: 1, // text
            //                     quality: 11, // goes from 1 (but quick) to 11 (but slow)
            //                 },
            //                 callback
            //             );
            //         },
            //     })
            //     : null,
        ],
        entry:
            {
                index: 'src/js/modules/index.js',
                search:
                    'src/js/modules/search.js',
                healthcheck:
                    'src/js/modules/healthcheck.js',
                submit:
                    'src/js/modules/submit.js',
                studies:
                    'src/js/modules/studies.js',
                study:
                    'src/js/modules/study.js',
                samples:
                    'src/js/modules/samples.js',
                sample:
                    'src/js/modules/sample.js',
                run:
                    'src/js/modules/run.js',
                compare:
                    'src/js/modules/compare.js',
                about:
                    'src/js/modules/about.js',
                help:
                    'src/js/modules/help.js',
                // biomes: 'src/js/modules/biomes.js',
                pipelines:
                    'src/js/modules/pipelines.js',
                pipeline:
                    'src/js/modules/pipeline.js',
            }
        ,
        output: {
            filename: '[name].js',
            path:
            __dirname + '/dist/js'
        }
        ,
        resolve: {
            modules: [__dirname, 'node_modules'],
            alias:
                {
                    handlebars: 'handlebars/dist/handlebars.min.js',
                }
            ,
        }
        ,
        module: {
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
                        {
                            loader: 'css-loader',
                        }
                    ]
                }, {
                    test: /\.(png|woff|woff2|eot|ttf|svg|gif)$/,
                    loader: 'url-loader?name=[path][name].[ext]?limit=100000'
                }
// }, {
                //     test: /\.(jpe?g|png|gif|svg)$/i,
                //     loader: 'file-loader?name=../[path][name].[ext]!html-loader'
                // }
            ]
        },
        devtool: "#inline-source-map",
    }

    return config;
};