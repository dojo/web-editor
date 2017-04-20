export = function (grunt: IGrunt) {
	grunt.loadNpmTasks('grunt-contrib-clean');

	return {
		coverage: {
			src: [ 'coverage-unmapped.json' ]
		},

		dev: {
			src: [ '<%= devDirectory %>/**/*' ]
		},

		dist: {
			src: [ '<%= distDirectory %>/**/*' ],
			fliter(path: string) {
				return grunt.option('remove-links') ? true : !grunt.file.isLink(path);
			}
		}
	};
};
