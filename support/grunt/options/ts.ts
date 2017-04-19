export = function(grunt: IGrunt) {
	grunt.loadNpmTasks('grunt-ts');

	return {
		dev: {
			tsconfig: {
				passThrough: true,
				tsconfig: 'tsconfig.json'
			}
		},

		dist: {
			tsconfig: {
				passThrough: true,
				tsconfig: 'tsconfig.dist.json'
			}
		}
	};
};
