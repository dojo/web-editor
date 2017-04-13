export = function (grunt: IGrunt) {
	grunt.loadNpmTasks('grunt-contrib-clean');

	return {
		dev: {
			src: [ '<%= devDirectory %>/**/*' ]
		},

		dist: {
			src: [ 'dist/**/*' ],
			fliter(path: string) {
				return grunt.option('remove-links') ? true : !grunt.file.isLink(path);
			}
		}
	};
};
