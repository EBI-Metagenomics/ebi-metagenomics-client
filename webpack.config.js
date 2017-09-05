var path = require('path');

module.exports = {
    entry: {
        index: 'src/main.js',
        search: 'src/modules/search.js',
        submit: 'src/modules/submit.js',
        studies: 'src/modules/studies.js',
        study: 'src/modules/study.js',
        samples: 'src/modules/samples.js',
        sample: 'src/modules/sample.js',
        run: 'src/modules/run.js',
        compare: 'src/modules/compare.js',
        about: 'src/modules/about.js',
        contact: 'src/modules/contact.js'
    },
    output: {
        filename: '[name].js',
        path: __dirname + '/dist',
    },
    resolve: {
        modules: [__dirname, 'node_modules'],
        alias: {
            handlebars: 'handlebars/dist/handlebars.min.js',
        }
    },
    module: {
        loaders: [
            {test: /\.css$/, loader: "style-loader!css-loader"},
            {
                test: /\.hbs$/,
                loader: __dirname + "/../../../",
                query: {
                    partialDirs: [
                        path.join(__dirname + "../", 'templates', 'partials')
                    ]
                }
            }
        ],
        rules: [
            {
                test: /\.js$/,
                exclude: /(node_modules|bower_components)/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: ['env']
                    }
                }
            },
            {test: /\.handlebars$/, loader: "handlebars-loader"}
        ]
    }
}