import { ProjectFile, ProjectFileType } from '@dojo/cli-export-project/interfaces/project.json';
import { EmitFile } from '../interfaces';

export function getEmit(...files: ProjectFile[]): EmitFile[] {
	return files.map(({ name, text }) => {
		return { name: name + '.js', text: `define([], function () { return '${JSON.stringify(JSON.parse(text))}'; });`, type: ProjectFileType.JavaScript };
	});
}
