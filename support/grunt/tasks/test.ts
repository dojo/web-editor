export = function(grunt: IGrunt) {
	grunt.registerTask('test', function () {
		const flags = Object.keys(this.flags);

		if (!flags.length) {
			flags.push('node');
		}

		grunt.option('force', true);

		grunt.task.run('dev');
		flags.forEach((flag) => grunt.task.run(`intern:${flag}`));
		grunt.task.run('remapIstanbul:coverage');
		grunt.task.run('clean:coverage');
	});
};
