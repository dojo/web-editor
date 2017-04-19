export = function(grunt: IGrunt) {
	grunt.loadNpmTasks('grunt-contrib-copy');

	return {
		dev: {
			expand: true,
			cwd: '.',
			src: [ '{src,tests}/**/*.{html,css,json,txt}' ],
			dest: '<%= devDirectory %>'
		},

		dist: {
			files: [ {
				expand: true,
				cwd: 'src/',
				src: [ '**/*.{html,css,json,text}' ],
				dest: '<%= distDirectory %>'
			}, {
				expand: true,
				cwd: '.',
				src: [ 'projects/**/*.json', 'package.json', 'README.md', 'node_modules/monaco-editor/**/*' ],
				dest: '<%= distDirectory %>'
			} ]
		}
	};
};
