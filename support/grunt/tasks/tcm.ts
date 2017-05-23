import ITask = grunt.task.ITask;
import * as glob from 'glob';
const DtsCreator = require('typed-css-modules/lib/dtsCreator').DtsCreator;

export = function (grunt: IGrunt) {
	grunt.registerTask('tcm', function (this: ITask) {
		const done = this.async();
		const creator = new DtsCreator({
			rootDir: process.cwd(),
			searchDir: 'src',
			outDir: 'src',
			camelCase: true,
			dropExtension: false
		});
		glob('src/**/*.m.css', (err, matches) => {
			if (err) {
				grunt.log.error(err.message);
				done(false);
				return;
			}
			Promise.all(matches.map((filename) => {
				return creator.create(filename)
					.then((content: any) => content.writeFile())
					.then((content: any) => {
						grunt.log.verbose.writeln(`Wrote ${content.outputFilePath}`);
						content.messageList.forEach((message: string) => {
							grunt.log.warn(message);
						});
					});
			}))
			.then((files) => {
				grunt.log.oklns(`${files.length} typed CSS definition files written.`);
				done();
			}, (err: Error) => {
				grunt.log.error(err.message);
				done(false);
			});
		});
	});
};
