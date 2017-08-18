import webpackConfig from '../../../webpack.config';

export = function(grunt: IGrunt) {
	grunt.loadNpmTasks('grunt-webpack');

	return {
		options: {
			progress: true
		},
		dev: webpackConfig,
		dist: webpackConfig
	};
};
