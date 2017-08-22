// var path = require('path');

module.exports = {
	entry: './entry.js',
	output: {
		path: __dirname,
		filename: 'bundle.js',
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