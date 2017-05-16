import { ProjectFile } from '@dojo/cli-export-project/interfaces/project.json';
import WeakMap from '@dojo/shim/WeakMap';
import { EmitFile } from '../../src/interfaces';

export const definitionMap = new WeakMap<ProjectFile, ProjectFile>();
export const emitMap = new WeakMap<ProjectFile, EmitFile[]>();

export default {
	getDefinitions(...files: ProjectFile[]): Promise<ProjectFile[]> {
		const definitions = files.map((file) => definitionMap.get(file));
		return Promise.resolve(definitions);
	},
	getEmit(...files: ProjectFile[]): Promise<EmitFile[]> {
		let emit: EmitFile[] = [];
		files.forEach((file) => emit.concat(emitMap.get(file)));
		return Promise.resolve(emit);
	}
};
