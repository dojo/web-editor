export = function (grunt: IGrunt) {
	grunt.loadNpmTasks('grunt-auto-install');

	return {
		dist: {
			options: {
				cwd: '<%= distDirectory %>',
				failOnError: true,
				npm: '--production'
			}
		}
	};
};
