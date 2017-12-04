import Map from '@dojo/shim/Map';
import { ProjectFile } from '@dojo/cli-export-project/interfaces/project.json';
import { Project, Program } from '../../src/project';

export const projectFilesMap = new Map<string, ProjectFile>();

export function reset() {
	projectFilesMap.clear();
}

const project: Project = {
	addFile(file: ProjectFile) {
		projectFilesMap.set(file.name, file);
		return Promise.resolve();
	},
	includes(filename: string) {
		return projectFilesMap.has(filename);
	},
	getFileModel(filename: string) {
		return {};
	},
	getProgram() {
		return Promise.resolve({
			css: [],
			dependencies: {},
			html: '',
			modules: {}
		} as Program);
	}
} as any;

export default project;
