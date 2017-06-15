import { createProcessors } from '../util/postcss';
import * as path from 'path';
const postCssImport = require('postcss-import');
const postCssNext = require('postcss-cssnext');

export = function init(grunt: IGrunt) {
	grunt.loadNpmTasks('grunt-postcss');

	const distDirectory = grunt.config.get<string>('distDirectory') || '';
	const devDirectory = grunt.config.get<string>('devDirectory') || '';

	const variablesProcessors = [
		postCssImport,
		postCssNext({
			features: {
				customProperties: {
					preserve: 'computed'
				}
			}
		})
	];

	function moduleFiles(dest: string) {
		return [ {
			expand: true,
			src: [ '**/*.m.css' ],
			dest: dest,
			cwd: 'src'
		} ];
	}

	const cssFiles = [ {
		expand: true,
		src: [ '**/*.css', '!**/*.m.css' ],
		dest: distDirectory,
		cwd: 'src'
	} ];

	grunt.config.set('postcss', {
		options: {
			map: true
		},
		dev: {
			files: moduleFiles(path.join(devDirectory, 'src')),
			options: {
				processors: createProcessors(devDirectory)
			}
		},
		dist: {
			files: moduleFiles(distDirectory),
			options: {
				processors: createProcessors(distDirectory, 'src', true)
			}
		},
		variables: {
			files: cssFiles,
			options: {
				processors: variablesProcessors
			}
		}
	});
};
