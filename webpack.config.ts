import * as webpack from 'webpack';
import { existsSync } from 'fs';
import { resolve, join, sep, isAbsolute } from 'path';

// loaders
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const postcssImport = require('postcss-import');
const postcssCssNext = require('postcss-cssnext');

// plugins
import CoreLoadPlugin from '@dojo/cli-build-webpack/plugins/CoreLoadPlugin';
// const AutoRequireWebpackPlugin = require('auto-require-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
// const HtmlWebpackPlugin = require('html-webpack-plugin');
// const HtmlWebpackIncludeAssetsPlugin = require('html-webpack-include-assets-plugin');
const { IgnorePlugin, NormalModuleReplacementPlugin, ContextReplacementPlugin } = webpack;

function isRelative(id: string): boolean {
	const first = id.charAt(0);
	return first !== '/' && first !== '@' && /^\W/.test(id);
}

const basePath = __dirname;
const localIdentName = '[hash:base64:8]';
const cssLoader = ExtractTextPlugin.extract({
	use: 'css-loader?sourceMap!resolve-url-loader'
});
const cssModuleLoader = ExtractTextPlugin.extract({
	use: [
		'css-module-decorator-loader',
		`css-loader?modules&sourceMap&importLoaders=1&localIdentName=${localIdentName}!resolve-url-loader`,
		{
			loader: 'postcss-loader?sourceMap',
			options: {
				plugins: [
					postcssImport,
					postcssCssNext({
						features: {
							autoprefixer: {
								browsers: ['last 2 versions', 'ie >= 10']
							}
						}
					})
				]
			}
		}
	]
});

module.exports = (env: string, args: string[]) => {
	return {
		entry: {
			main: [
				'./src/main.css',
				'./src/main.ts'
			],
			'support/providers/amdRequire': './src/support/providers/amdRequire.ts',
			'support/worker-proxy': './src/support/worker-proxy.ts',
			'examples/index': './src/examples/index.ts',
			postcss: './support/webpack/postcss.ts'
		},
		output: {
			libraryTarget: 'umd',
			filename: '[name].js',
			path: resolve(__dirname, 'dist')
		},
		context: basePath,
		module: {
			rules: [
				{
					test: require.resolve('postcss-cssnext'),
					use: [ { loader: 'expose-loader', options: 'cssnext' } ]
				},
				{
					test: require.resolve('postcss'),
					use: [ { loader: 'expose-loader', options: 'postcss' } ]
				},
				{
					test: require.resolve('postcss-modules'),
					use: [ { loader: 'expose-loader', options: 'postcssModules' } ]
				},
				{
					test: /\.tsx?$/,
					enforce: 'pre',
					loader: 'tslint-loader',
					options: {
						tsConfigFile: resolve(__dirname, 'tslint.json')
					}
				},
				{
					test: /@dojo\/.*\.js$/,
					enforce: 'pre',
					loader: 'source-map-loader-cli',
					options: { includeModulePaths: true }
				},
				{
					test: /src[\\\/].*\.ts?$/,
					enforce: 'pre',
					loader: 'css-module-dts-loader?type=ts&instanceName=0_dojo'
				},
				{
					test: /src[\\\/].*\.m\.css?$/,
					enforce: 'pre',
					loader: 'css-module-dts-loader?type=css'
				},
				{
					test: /src[\\\/].*\.ts(x)?$/,
					use: [
						'umd-compat-loader',
						{
							loader: 'ts-loader',
							options: { instance: 'dojo' }
						}
					]
				},
				{
					test: /\.js?$/,
					loader: 'umd-compat-loader'
				},
				{
					test: new RegExp(`globalize(\\${sep}|$)`),
					loader: 'imports-loader?define=>false'
				},
				{
					test: /.*\.(gif|png|jpe?g|svg|eot|ttf|woff|woff2)$/i,
					loader: 'file-loader?hash=sha512&digest=hex&name=[hash:base64:8].[ext]'
				},
				{
					test: /\.css$/, exclude: /src[\\\/].*/,
					loader: cssLoader
				},
				{
					test: /src[\\\/].*\.css?$/,
					loader: cssModuleLoader
				},
				{
					test: /\.m\.css\.js$/,
					exclude: /src[\\\/].*/,
					use: ['json-css-module-loader']
				},
				{
					test: /tests[\\\/].*\.ts?$/,
					use: [
						'umd-compat-loader',
						{
							loader: 'ts-loader',
							options: { instance: 'dojo' }
						}
					]
				}
			]
		},
		plugins: [
			// new AutoRequireWebpackPlugin('examples/index'),
			new NormalModuleReplacementPlugin(/\.m\.css$/, (result: any) => {
				if (isAbsolute(result.request)) {
					return;
				}
				const requestFileName = isRelative(result.request) ?
					resolve(result.context, result.request) : resolve(basePath, 'node_modules', result.request);
				const jsFileName = requestFileName + '.js';

				if (existsSync(jsFileName)) {
					result.request = result.request.replace(/\.m\.css$/, '.m.css.js');
				}
			}),
			// new HtmlWebpackPlugin({
			// 	inject: true,
			// 	chunks: [ 'examples/index', 'postcss' ],
			// 	template: 'src/examples/index.html'
			// }),
			new IgnorePlugin(/request\/providers\/node/),
			new ContextReplacementPlugin(/dojo-app[\\\/]lib/, { test: () => false }),
			new ContextReplacementPlugin(/.*/, { test: () => false }),
			new ExtractTextPlugin({ filename: 'main.css', allChunks: true }),
			new CopyWebpackPlugin([ { context: 'src', from: '**/*', ignore: '*.ts' } ]),
			new CoreLoadPlugin({ basePath }),
			new CopyWebpackPlugin([
				{ from: resolve(__dirname, 'node_modules/monaco-editor/min/vs'), to: 'vs' }
			])
			// new HtmlWebpackIncludeAssetsPlugin({
			// 	assets: ['vs/loader.js', 'configureLoader.js'],
			// 	append: false
			// })
		],
		node: {
			dgram: 'empty',
			net: 'empty',
			tls: 'empty',
			fs: 'empty'
		},
		resolveLoader: {
			modules: [
				resolve(__dirname, 'node_modules/@dojo/cli-build-webpack/loaders'),
				join(__dirname, 'node_modules')
			],
			extensions: [ '.ts', '.js' ]
		},
		resolve: {
			extensions: ['.ts', '.js']
		},
		devtool: 'cheap-module-eval-source-map'
	};
};
