import { ProjectFile } from '@dojo/cli-export-project/interfaces/project.json';
import Promise from '@dojo/shim/Promise';
import WeakMap from '@dojo/shim/WeakMap';
import { EmitFile } from '../../src/interfaces';

export const definitionMap = new WeakMap<ProjectFile, ProjectFile>();

export default {
	getDefinitions(...files: ProjectFile[]): Promise<ProjectFile[]> {
		const definitions = files.map((file) => definitionMap.get(file));
		return Promise.resolve(definitions);
	},
	getEmit(...files: ProjectFile[]): Promise<EmitFile[]> {
		return Promise.resolve(files);
	}
};
