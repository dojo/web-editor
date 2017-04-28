export = function(grunt: IGrunt) {
	grunt.registerTask('ci', function () {
		grunt.option('force', true);

		grunt.task.run('dev');
		grunt.task.run('intern:node');
		grunt.task.run('intern');
		grunt.task.run('remapIstanbul:ci');
		grunt.task.run('uploadCoverage');
		grunt.task.run('clean:coverage');
	});
};
