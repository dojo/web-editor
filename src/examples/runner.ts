import { ProjectFileType } from '@dojo/cli-emit-editor/interfaces/editor';
import Runner from '../Runner';
import project from '../project';

const runner = new Runner();

(async () => {
	await project.load('dojo-test-app.project.json');
	const program = await project.emit();

	const modules = program
		.filter(({ type }) => type === ProjectFileType.JavaScript)
		.reduce((map, { name, text }) => {
			map[name.replace(/\.js$/, '')] = text;
			return map;
		}, {} as { [mid: string]: string });
	runner.run(document.getElementById('runner')!, project.getDependencies(), modules);
})();
