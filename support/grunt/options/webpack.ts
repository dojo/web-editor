import { resolve } from 'path';
import { cwd } from 'process';

/* tslint:disable:variable-name */
const UglifyJsPlugin: any = require('webpack/lib/optimize/UglifyJsPlugin');

export = function(grunt: IGrunt) {
	grunt.loadNpmTasks('grunt-webpack');

	return {
		dev: {
			entry: './support/webpack/postcss.ts',
			output: {
				filename: 'postcss-bundle.js',
				path: resolve(cwd(), '<%= devDirectory %>/src/external')
			},
			module: {
				rules: [ {
					test: require.resolve('postcss-cssnext'),
					use: [ {
						loader: 'expose-loader',
						options: 'cssnext'
					} ]
				}, {
					test: require.resolve('postcss'),
					use: [ {
						loader: 'expose-loader',
						options: 'postcss'
					} ]
				}, {
					test: require.resolve('postcss-modules'),
					use: [ {
						loader: 'expose-loader',
						options: 'postcssModules'
					} ]
				} ]
			},
			node: {
				'fs': 'empty'
			}
		},

		dist: {
			entry: './support/webpack/postcss.ts',
			output: {
				filename: 'postcss-bundle.js',
				path: resolve(cwd(), '<%= distDirectory %>/external')
			},
			plugins: [ new UglifyJsPlugin({
				output: {
					'ascii_only': true
				}
			}) ],
			module: {
				rules: [ {
					test: require.resolve('postcss-cssnext'),
					use: [ {
						loader: 'expose-loader',
						options: 'cssnext'
					} ]
				}, {
					test: require.resolve('postcss'),
					use: [ {
						loader: 'expose-loader',
						options: 'postcss'
					} ]
				}, {
					test: require.resolve('postcss-modules'),
					use: [ {
						loader: 'expose-loader',
						options: 'postcssModules'
					} ]
				} ]
			},
			node: {
				'fs': 'empty'
			}
		}
	};
};
