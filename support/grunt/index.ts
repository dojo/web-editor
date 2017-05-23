import * as glob from 'glob';
import { basename, join } from 'path';

export function initConfig(grunt: IGrunt, otherOptions: any) {
	const tsconfig = grunt.file.readJSON('tsconfig.json');
	const tsconfigDist = grunt.file.readJSON('tsconfig.dist.json');
	const packageJson = grunt.file.readJSON('package.json');

	grunt.initConfig({
		name: packageJson.name,
		version: packageJson.version,
		tsconfig,
		tsconfigDist,

		devDirectory: '<%= tsconfig.compilerOptions.outDir %>',
		distDirectory: '<%= tsconfigDist.compilerOptions.outDir %>'
	});

	/* load options */
	const options: { [option: string]: any } = {};
	glob.sync('*.ts', {
			cwd: join(__dirname, 'options')
		})
		.forEach((filename) => {
			const optionName = basename(filename, '.ts');
			options[optionName] = require(`./options/${optionName}`)(grunt);
		});

	grunt.config.merge(options);

	/* merge other options */
	if (otherOptions) {
		grunt.config.merge(otherOptions);
	}

	/* load tasks */
	glob.sync('*.ts', {
			cwd: join(__dirname, 'tasks')
		})
		.forEach((filename) => {
			const task = basename(filename, '.ts');
			require(`./tasks/${task}`)(grunt);
		});

	grunt.registerTask('dev', [ 'clean:dev', 'tcm', 'ts:dev', 'copy:dev', 'postcss:dev', 'webpack:dev' ]);

	grunt.registerTask('dist', [ 'clean:dist', 'tcm', 'ts:dist', 'copy:dist', 'patch', 'postcss:dist', 'webpack:dist', 'auto_install:dist' ]);

	grunt.registerTask('default', [ 'dev' ]);
}
