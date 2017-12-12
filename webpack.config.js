var webpack = require('webpack'),
path = require('path'),
HtmlWebpackPlugin = require('html-webpack-plugin'),
CopyWebpackPlugin = require('copy-webpack-plugin')
WebpackUglifyJsPlugin = require('webpack-uglify-js-plugin');
fs = require('fs');

/* babel */
const babelSettings = JSON.parse(fs.readFileSync(".babelrc"));

const config = {
	entry:{
		app:'./src/index.js'
	},
	output:{
		path:path.resolve(__dirname,'build'),
		filename:'rebelchat.js'
	},
	resolve:{
		extensions:['.js']
	},
	devServer:{
		contentBase: path.resolve(__dirname, 'public'),
		host: '0.0.0.0',
		port: 8000,
		inline: true
	},
	module:{
		loaders:[
			{
				test: /index\.js$/,
				loader: 'webpack-replace',
				query: {
					search: '__STYLE__',
					replace: 'style.css'
				}
			},
			{
				test: /(\.js)$/,
				exclude: /node_modules/,
				loader:'babel-loader',
				query:babelSettings
			},
			{
				test: /(\.html|\.css)$/,
				use: 'raw-loader'
			}
		]
	},
	plugins:[
		new HtmlWebpackPlugin({
			template: path.resolve(__dirname, 'public/index.html'),
			hash: true,
			filename: 'index.html',
			inject: 'body'
		})
	],
	devtool: "source-map"
};

if (process.env.NODE_ENV === 'production') {
	config.plugins.push(
		new WebpackUglifyJsPlugin({
			cacheFolder: path.resolve(__dirname, 'build'),
			debug: true,
			minimize: true,
			sourceMap: false,
			output: {
				comments: false
			},
			compressor: {
				warnings: false
			}
		})
	)
	
	config.module.loaders[0].query.replace = 'style.min.css';
}


module.exports = config;
