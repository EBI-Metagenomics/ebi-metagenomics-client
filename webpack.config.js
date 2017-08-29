// var path = require('path');

module.exports = {
	entry: {
        index: 'src/main.js',
        projects: 'src/modules/projects.js',
        project: 'src/modules/project.js'
    ***REMOVED***,
	output: {
        filename: '[name].js',
		path: __dirname + '/dist',
	***REMOVED***,
	resolve: {
		modules: [ __dirname, 'node_modules']
	***REMOVED***,
    module: {
        loaders: [
             { test: /\.css$/, loader: "style-loader!css-loader" ***REMOVED***
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
		    ***REMOVED***
		  ]
    ***REMOVED***
***REMOVED***