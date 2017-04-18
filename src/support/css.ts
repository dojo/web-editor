import { ProjectFile, ProjectFileType } from '@dojo/cli-emit-editor/interfaces/editor';
import { EmitFile } from '../interfaces';
import postcss from './postcss';
import cssnext from './postcssCssnext';
import postcssModules from './postcssModules';

function classesToDefinition(classes: { [className: string]: string; }): string {
	return Object.keys(classes)
		.reduce((previous, className) => {
			return previous + `export const ${className}: string;\n`;
		}, '');
}

function classesToAMD(classes: { [className: string]: string; }): string {
	const result = Object.keys(classes)
		.map((className) => `\t'${className}': '${classes[className]}'`)
		.join(',\n');
	return `define([], function () {
		return {
		${result}
		};
	});\n`;
}

export async function getDefinitions(...files: ProjectFile[]) {

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
		const result = await processor.process(file.text);
		emitFiles.push({
			name: file.name,
			text: result.css,
			type: ProjectFileType.CSS
		});

		if (mappedClasses) {
			emitFiles.push({
				name: file.name + '.js',
				text: classesToAMD(mappedClasses),
				type: ProjectFileType.JavaScript
			});
		}
	}
	return emitFiles;
}
