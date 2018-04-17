const webpack = require('webpack');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');

const getCompressionPlugin = (() => {
    let plugin;
    return () => {
        if (!plugin) plugin = require('compression-webpack-plugin');
        return plugin;
    };
})();

const subfolder = process.env.DEPLOYMENT_SUBFOLDER;
const apiUrl = process.env.API_URL;
const sequenceSearchUrl = process.env.SEQUENCE_SEARCH_URL;

const templateFixtures = {
    subfolder: subfolder,
    apiUrl: apiUrl,
    sequenceSearchUrl: sequenceSearchUrl
};

module.exports = (env = {prod: false}) => {
    return {
        plugins: [
            new HtmlWebpackPlugin({
                title: 'About page',
                inject: true,
                filename: 'about.html',
                template: 'handlebars-loader!./src/about.html',
                chunks: ['about'],
                templateData: templateFixtures
            }),
            new HtmlWebpackPlugin({
                title: 'Biomes page',
                inject: true,
                filename: 'biomes.html',
                template: 'handlebars-loader!./src/biomes.html',
                chunks: ['biomes'],
                templateData: templateFixtures
            }),
            new HtmlWebpackPlugin({
                title: 'Browse page',
                inject: true,
                filename: 'browse.html',
                template: 'handlebars-loader!./src/browse.html',
                chunks: ['browse'],
                templateData: templateFixtures
            }),
            new HtmlWebpackPlugin({
                title: 'Compare page',
                inject: true,
                filename: 'compare.html',
                template: 'handlebars-loader!./src/compare.html',
                chunks: ['compare'],
                templateData: templateFixtures
            }),
            new HtmlWebpackPlugin({
                title: 'Healthcheck page',
                inject: true,
                filename: 'healthcheck.html',
                template: 'handlebars-loader!./src/healthcheck.html',
                chunks: ['healthcheck'],
                templateData: templateFixtures
            }),
            new HtmlWebpackPlugin({
                title: 'Help page',
                inject: true,
                filename: 'help.html',
                template: 'handlebars-loader!./src/help.html',
                chunks: ['help'],
                templateData: templateFixtures
            }),
            new HtmlWebpackPlugin({
                title: 'Index page',
                inject: true,
                filename: 'index.html',
                template: 'handlebars-loader!./src/index.html',
                chunks: ['index'],
                templateData: templateFixtures
            }),
            new HtmlWebpackPlugin({
                title: 'Login page',
                inject: true,
                filename: 'login.html',
                template: 'handlebars-loader!./src/login.html',
                chunks: ['login'],
                templateData: templateFixtures
            }),
            new HtmlWebpackPlugin({
                title: 'Pipeline page',
                inject: true,
                filename: 'pipeline.html',
                template: 'handlebars-loader!./src/pipeline.html',
                chunks: ['pipeline'],
                templateData: templateFixtures
            }),
            new HtmlWebpackPlugin({
                title: 'Pipelines page',
                inject: true,
                filename: 'pipelines.html',
                template: 'handlebars-loader!./src/pipelines.html',
                chunks: ['pipelines'],
                templateData: templateFixtures
            }),
            new HtmlWebpackPlugin({
                title: 'Run page',
                inject: true,
                filename: 'run.html',
                template: 'handlebars-loader!./src/run.html',
                chunks: ['run'],
                templateData: templateFixtures
            }),
            new HtmlWebpackPlugin({
                title: 'Sample page',
                inject: true,
                filename: 'sample.html',
                template: 'handlebars-loader!./src/sample.html',
                chunks: ['sample'],
                templateData: templateFixtures
            }),
            new HtmlWebpackPlugin({
                title: 'Search page',
                inject: true,
                filename: 'search.html',
                template: 'handlebars-loader!./src/search.html',
                chunks: ['search'],
                templateData: templateFixtures
            }),
            new HtmlWebpackPlugin({
                title: 'Study page',
                inject: true,
                filename: 'study.html',
                template: 'handlebars-loader!./src/study.html',
                chunks: ['study'],
                templateData: templateFixtures
            }),
            new HtmlWebpackPlugin({
                title: 'Submit page',
                inject: true,
                filename: 'submit.html',
                template: 'handlebars-loader!./src/submit.html',
                chunks: ['submit'],
                templateData: templateFixtures
            }),
            new webpack.EnvironmentPlugin(
                [
                    'API_URL',
                    'SEARCH_URL',
                    'INTERPRO_URL',
                    'SEQUENCE_SEARCH_URL',
                    'ENA_URL',
                    'DEPLOYMENT_SUBFOLDER']
            ),
            new CleanWebpackPlugin(['dist']),
            new webpack.ProvidePlugin({
                '$': 'jquery',
                'jQuery': 'jquery',
                'window.jQuery': 'jquery'
            }),
            // GZIP compression
            env.prod ? new (getCompressionPlugin())({
                    asset: '[path].gz[query]',
                    test: /\.(js|css|html|svg)$/i,
                    cache: true,
                    algorithm(buffer, options, callback) {
                        require('node-zopfli').gzip(buffer, options, callback);
                    }
                })
                : null,
            // // Brotli compression
            env.prod
                ? new (getCompressionPlugin())({
                    asset: '[path].br[query]',
                    test: /\.(js|css|html|svg)$/i,
                    cache: true,
                    algorithm(buffer, _, callback) {
                        require('iltorb').compress(
                            buffer,
                            {
                                mode: 1, // text
                                quality: 11 // goes from 1 (but quick) to 11 (but slow)
                            },
                            callback
                        );
                    }
                })
                : null,
            // new HandlebarsPlugin({
            //     // path to hbs entry file(s)
            //     entry: path.join(__dirname, 'src', '*.html'),
            //     // output path and filename(s). This should lie within the webpacks output-folder
            //     // if ommited, the input filepath stripped of its extension will be used
            //     output: path.join(__dirname, 'dist', '[name].html'),
            //     // data passed to main hbs template: `main-template(data)`
            //     data: {
            //         subfolder: process.env.DEPLOYMENT_SUBFOLDER,
            //         apiUrl: process.env.API_URL,
            //         sequenceSearchUrl: process.env.SEQUENCE_SEARCH_URL
            //     },
            //     // path.join(__dirname, configFile),
            //     // globbed path to partials, where folder/filename is unique
            //     partials: [
            //         path.join(__dirname, 'src', 'partials', '*.handlebars')
            //     ]
            // }),
            new ExtractTextPlugin('[name].css')
        ].filter(Boolean), // filter out empty values
        entry: {
            index: 'src/js/modules/index.js',
            search:
                'src/js/modules/search.js',
            healthcheck:
                'src/js/modules/healthcheck.js',
            submit:
                'src/js/modules/submit.js',
            study:
                'src/js/modules/study.js',
            browse:
                'src/js/modules/browse.js',
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
            biomes: 'src/js/modules/biomes.js',
            pipelines:
                'src/js/modules/pipelines.js',
            pipeline:
                'src/js/modules/pipeline.js'
        },
        output: {
            filename: '[name].[hash].js',
            path:
            __dirname + '/dist',
            publicPath: process.env.DEPLOYMENT_SUBFOLDER + '/'
        },
        resolve: {
            modules: [__dirname, 'node_modules'],
            alias:
                {
                    handlebars: 'handlebars/dist/handlebars.min.js'
                }
        },
        module: {
            rules: [
                (env === 'prod' ? {
                    test: /\.js$/,
                    exclude: /(node_modules|bower_components)/,
                    use: {
                        loader: 'babel-loader',
                        options: {
                            presets: ['env']
                        }
                    }
                } : {
                    test: /\.js$/,
                    exclude: /(node_modules|bower_components)/,
                    use: {
                        loader: 'istanbul-instrumenter-loader',
                        query: {
                            esModules: true
                        }
                    }
                }), {
                    test: /\.(handlebars)$/,
                    loader: 'handlebars-loader',
                    query: {inlineRequires: '/images/'}
                }, {
                    test: /\.css$/,
                    use: ExtractTextPlugin.extract({
                        fallback: 'style-loader',
                        use: [
                            {
                                loader: 'css-loader',
                                options: {
                                    minimize: true,
                                    sourceMap: true
                                }
                            }]
                    })

                }, {
                    test: /\.(woff|woff2|eot|ttf)$/,
                    use: {
                        loader: 'file-loader',
                        options: {
                            name: '[path][name].[hash].[ext]'
                        }
                    }
                }, {
                    test: /\.(jpe?g|png|gif|svg|ico)$/,
                    loader: 'file-loader',
                    options: {
                        name: '[path][name].[ext]',
                        context: ''
                    }
                }
            ]
        },
        devtool: '#inline-source-map'
    };
};
