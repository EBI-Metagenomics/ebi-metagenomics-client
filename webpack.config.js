var path = require('path');

module.exports = {
    entry: {
        index: 'src/main.js',
        studies: 'src/modules/studies.js',
        study: 'src/modules/study.js'
    ***REMOVED***,
    output: {
        filename: '[name].js',
        path: __dirname + '/dist',
    ***REMOVED***,
    resolve: {
        modules: [__dirname, 'node_modules'],
        alias: {
            handlebars: 'handlebars/dist/handlebars.min.js'
        ***REMOVED***
    ***REMOVED***,
    module: {
        loaders: [
            {test: /\.css$/, loader: "style-loader!css-loader"***REMOVED***,
            {
                test: /\.hbs$/,
                loader: __dirname + "/../../../",
                query: {
                    partialDirs: [
                        path.join(__dirname+"../", 'templates', 'partials')
                    ]
                ***REMOVED***
            ***REMOVED***
        ],
        rules: [
            {
                test: /\.js$/,
                exclude: /(node_modules|bower_components)/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: ['env']
                    ***REMOVED***
                ***REMOVED***
            ***REMOVED***,
            {test: /\.handlebars$/, loader: "handlebars-loader"***REMOVED***
        ]
    ***REMOVED***
***REMOVED***