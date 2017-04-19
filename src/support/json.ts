import { ProjectFile, ProjectFileType } from '@dojo/cli-emit-editor/interfaces/editor';
import { EmitFile } from '../interfaces';

export function getEmit(...files: ProjectFile[]): EmitFile[] {
	return files.map(({ name, text }) => {
		return { name, text: `define([], function () { return '${JSON.stringify(JSON.parse(text))}'; });`, type: ProjectFileType.JavaScript };
	});
}
