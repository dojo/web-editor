import { v, w } from '@dojo/widget-core/d';
import { DNode } from '@dojo/widget-core/interfaces';
import Projector from '@dojo/widget-core/mixins/Projector';
import WidgetBase from '@dojo/widget-core/WidgetBase';
import project, { Program } from '../project';
import Workbench from '../Workbench';
import { load as loadTheme } from '../support/editorThemes';
import { IconJson, load as loadIcons } from '../support/icons';
import darkTheme from '../themes/dark/theme';

/* path to the project directory */
const PROJECT_DIRECTORY = '../../../projects/';

let icons: IconJson;
const iconsSourcePath = '../../extensions/vscode-material-icon-theme/out/src/material-icons.json';

/**
 * An example application widget that incorporates both the Editor and Runner widgets into a simplistic UI
 */
class App extends WidgetBase {
	private _compiling = false;
	private _editorFilename = '';
	private _program: Program | undefined;
	private _projectValue = 'dojo2-todo-mvc.project.json';

	/**
	 * Handle when the project name changes in the dropdown
	 * @param e The DOM `onchange` event
	 */
	private _onchangeProject(e: Event) {
		e.preventDefault();
		const select: HTMLSelectElement = e.target as any;
		this._projectValue = select.value;
	}

	/**
	 * Handle when the on project load button is clicked
	 * @param e The DOM `onclick` event
	 */
	private _onclickLoad(e: MouseEvent) {
		e.preventDefault();
		console.log(`Loading project "${this._projectValue}"...`);
		project.load(PROJECT_DIRECTORY + this._projectValue)
			.then(() => {
				console.log('Project loaded');
				this.invalidate();
			}, (err) => {
				console.error(err);
			});
	}

	/**
	 * Handle when the on project run button is clicked
	 * @param e The DOM `onclick` event
	 */
	private _onclickRun(e: MouseEvent) {
		e.preventDefault();
		console.log('Compiling project...');
		this._compiling = true;
		this.invalidate(); /* this will update the UI so "Run" is disabled */
		project.getProgram()
			.then((program) => {
				this._program = program;
				this.invalidate(); /* this will cause the properties to the runner to change, starting the run process */
			}, (err) => {
				console.error(err);
			});
	}

	private _onFileOpen(filename: string) {
		if (project.isLoaded() && project.includes(filename)) {
			this._editorFilename = filename;
		}
	}

	/**
	 * Handles when the Runner widget finishes running the project
	 */
	private _onRun() {
		this._compiling = false;
		this.invalidate(); /* this will enable the "Run" button in the UI */
	}

	render() {
		const isProjectLoaded = project.isLoaded();

		/* A UI to select a project and provide a button to load it */
		const projectLoad = v('div', { key: 'projectLoad' }, [
			v('label', { for: 'project' }, [ 'Project to load:' ]),
			v('select', { type: 'text', name: 'project', id: 'project', onchange: this._onchangeProject, disabled: isProjectLoaded ? true : false }, [
				v('option', { value: 'dojo-test-app.project.json' }, [ 'Dojo2 Hello World' ]),
				v('option', { value: 'dojo2-todo-mvc.project.json', selected: true }, [ 'Dojo2 Todo MVC' ]),
				v('option', { value: 'dojo2-todo-mvc-tsx.project.json' }, [ 'Dojo 2 JSX Todo MVC' ]),
				v('option', { value: 'dojo2-todo-mvc-kitchensink.project.json' }, [ 'Dojo2 Kitchensink Todo MVC' ])
			]),
			v('button', { type: 'button', name: 'load-project', id: 'load-project', onclick: this._onclickLoad, disabled: isProjectLoaded ? true : false }, [ 'Load' ])
		]);

		let fileSelect: DNode = null;
		/* If the project is loaded, then we will render a UI which allows selection of the file to edit and a button to run the project */
		if (isProjectLoaded) {
			fileSelect = v('div', { key: 'fileSelect' }, [
				v('div', [
					v('button', { type: 'button', name: 'run', id: 'run', onclick: this._onclickRun, disabled: this._compiling ? true : false }, [ 'Run' ])
				])
			]);
		}

		return v('div', {
			classes: { app: true }
		}, [
			projectLoad,
			fileSelect,
			w(Workbench, {
				filename: this._editorFilename,
				files: isProjectLoaded ? project.getFileNames() : undefined,
				icons,
				iconsSourcePath,
				program: this._program,
				theme: darkTheme,

				onFileOpen: this._onFileOpen,
				onRun: this._onRun
			})
		]);
	}
}

/* Mixin a projector to the App and create an instance */
const projector = new (Projector(App))();

(async function () {
	await loadTheme('../../data/editor-dark.json');
	icons = await loadIcons(iconsSourcePath);
	/* Start the projector and append it to the document.body */
	projector.append();
})();
