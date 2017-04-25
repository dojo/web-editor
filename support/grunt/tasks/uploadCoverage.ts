import ITask = grunt.task.ITask;
const sendToCodeCov = require('codecov.io/lib/sendToCodeCov.io');

export = function (grunt: IGrunt) {
	grunt.registerTask('uploadCoverage', function (this: ITask) {
		const done = this.async();

		const contents = grunt.file.read('coverage-final.json');
		sendToCodeCov(contents, function (err: Error) {
			done(err);
		});
	});
};
