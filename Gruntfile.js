require('ts-node')
	.register({
		'compilerOptions': {
			module: 'commonjs',
			target: 'es2017',
			lib: [
				'es5',
				'es2015',
				'es2016',
				'es2017'
			],
			typeRoots: [
				'node_modules/@types'
			],
			types: [
				'grunt',
				'intern'
			]
		}
	});

module.exports = function (grunt) {
	require('./support/grunt').initConfig(grunt);
};
