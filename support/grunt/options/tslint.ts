export = function (grunt: IGrunt) {
	grunt.loadNpmTasks('grunt-tslint');

	return {
		options: {
			configuration: grunt.file.readJSON('tslint.json')
		},
		src: {
			src: [
				'src/**/*.ts',
				'tests/**/*.ts'
			]
		}
	};
};
