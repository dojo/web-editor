import { ProjectFile, ProjectFileType } from '@dojo/cli-export-project/interfaces/project.json';
import { EmitFile } from '../interfaces';
import postcss = require('postcss');
import cssnext = require('postcss-cssnext');
import postcssModules = require('postcss-modules');

/**
 * Take a map of classes and return the text of a `.d.ts` file which describes those class names
 * @param classes A map of classes
 */
function classesToDefinition(classes: { [className: string]: string; }): string {
	return Object.keys(classes)
		.reduce((previous, className) => {
			return previous + `export const ${className}: string;\n`;
		}, '');
}

/**
 * Take a map of classes and return an AMD module which returns an object of those class names
 * @param classes A map of classes
 * @param key A string which will be the key for the object map
 */
function classesToAMD(classes: { [className: string]: string; }, key: string): string {
	const result = Object.keys(classes)
		.map((className) => `\t'${className}': '${classes[className]}'`);
	result.push(`\t' _key': '${key}'`);

	return `define([], function () {
		return {
		${result.join(',\n')}
		};
	});\n`;
}

/**
 * Generate definition files for CSS Modules.
 *
 * This function takes a CSS Module, generates the modularised class names and then returns a `.d.ts` file
 * that contains the source class names which can be used to import the CSS Module into a TypeScript module.
 * @param files Project files to generate definitions for.
 */
export async function getDefinitions(...files: ProjectFile[]): Promise<ProjectFile[]> {

	let mappedClasses: { [className: string]: string } | undefined;
	function getJSON(filename: undefined, json: { [className: string]: string }) {
		filename;
		mappedClasses = json;
	}

	const processor = postcss([
		postcssModules({ getJSON })
	]);

	const definitionFiles: ProjectFile[] = [];
	for (let i = 0; i < files.length; i++) {
		const file = files[i];
		mappedClasses = undefined;
		await processor.process(file.text);
		if (mappedClasses) {
			definitionFiles.push({
				name: file.name + '.d.ts',
				text: classesToDefinition(mappedClasses),
				type: ProjectFileType.Definition
			});
		}
	}
	return definitionFiles;
}

/**
 * Emit transpiled CSS Modules.
 *
 * This function takes in any number of project files and resolves with an array of emitted files which will contain two files
 * for each CSS module, a AMD module which returns a map of class names which have been localised and a CSS file which contains
 * the localised CSS.
 * @param files Project files to generate emitted CSS for.
 */
export async function getEmit(...files: ProjectFile[]): Promise<EmitFile[]> {

	let mappedClasses: { [className: string]: string } | undefined;
	function getJSON(filename: undefined, json: { [className: string]: string }) {
		filename;
		mappedClasses = json;
	}

	const processor = postcss([
		cssnext({
			features: {
				autoprefixer: {
					browsers: [ 'last 2 versions', 'ie >= 11' ]
				}
			}
		}),
		postcssModules({ getJSON })
	]);

	const emitFiles: EmitFile[] = [];
	for (let i = 0; i < files.length; i++) {
		const file = files[i];
		mappedClasses = undefined;
		const result = await processor.process(`/* from: ${file.name} */\n\n` + file.text, {
			from: file.name,
			map: {
				sourcesContent: true
			}
		});

		/* add emitted css text */
		emitFiles.push({
			name: file.name,
			text: result.css,
			type: ProjectFileType.CSS
		});

		if (mappedClasses) {
			/* get the basename and strip the extension to be used as the key for the localised CSS */
			const key = file.name.split('/').pop()!.replace(/(\.m)?\.css$/, '');
			emitFiles.push({
				name: file.name + '.js',
				text: classesToAMD(mappedClasses, key),
				type: ProjectFileType.JavaScript
			});
		}
	}
	return emitFiles;
}
