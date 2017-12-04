import { from } from '@dojo/shim/array';
import Set from '@dojo/shim/Set';
import { v, w } from '@dojo/widget-core/d';
import Projector from '@dojo/widget-core/mixins/Projector';
import WidgetBase from '@dojo/widget-core/WidgetBase';
import project, { Program } from '../project';
import Workbench from '../Workbench';
import { load as loadTheme } from '../support/editorThemes';
import { IconJson, load as loadIcons } from '../support/icons';
import darkTheme from '../themes/dark/theme';

/* path to the project directory */
const PROJECTS_PATH = '../../../projects/';
const EDITOR_THEME = '../../data/editor-dark.json';
const iconsSourcePath = '../../extensions/vscode-material-icon-theme/out/src/material-icons.json';

let icons: IconJson;

/**
 * An example application widget that incorporates both the Editor and Runner widgets into a simplistic UI
 */
class App extends WidgetBase {
	private _compiling = false;
	private _editorFilename = '';
	private _openFiles = new Set<string>();
	private _program: Program | undefined;
	private _projectDirty = true;
	private _projectValue = '005-initial.project.json';

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
		project.load(PROJECTS_PATH + this._projectValue)
			.then(() => {
				console.log('Project loaded');
				this.invalidate();
			}, (err) => {
				console.error(err);
			});
	}

	private _onFileClose(filename: string) {
		const { _openFiles } = this;
		_openFiles.delete(filename);
		if (this._editorFilename === filename) {
			if (!_openFiles.size) {
				this._editorFilename = '';
			}
			else {
				this._editorFilename = _openFiles.values().next().value;
			}
		}
		this.invalidate();
	}

	private _onFileOpen(filename: string) {
		if (project.isLoaded() && project.includes(filename)) {
			this._editorFilename = filename;
			this._openFiles.add(filename);
			this.invalidate();
		}
	}

	private _onFileSelect(filename: string) {
		this._editorFilename = filename;
		this.invalidate();
	}

	private async _onDirty() {
		this._projectDirty = true;
		if (project.isLoaded() && this._editorFilename) {
			await project.setFileDirty(this._editorFilename);
		}
		this.invalidate();
	}

	private _onRun() {
		this._compiling = false;
		this.invalidate();
	}

	/**
	 * Handle when the on project run button is clicked
	 */
	private async _onRunClick() {
		if (this._compiling || !project.isLoaded() || !this._projectDirty) {
			return;
		}
		console.log('Compiling project...');
		this._compiling = true;
		this.invalidate(); /* this will update the UI so "Run" is disabled */
		try {
			const program = await project.getProgram();
			this._program = program;
			this._projectDirty = false;
			this.invalidate(); /* this will cause the properties to the runner to change, starting the run process */
		}
		catch (err) {
			console.error(err);
		}
	}

	render() {
		const isProjectLoaded = project.isLoaded();
		const filename = this._editorFilename;

		/* A UI to select a project and provide a button to load it */
		const projectLoad = v('div', { key: 'projectLoad' }, [
			v('label', { for: 'project' }, [ 'Project to load:' ]),
			v('select', { type: 'text', name: 'project', id: 'project', onchange: this._onchangeProject, disabled: isProjectLoaded ? true : false }, [
				v('option', { value: '005-initial.project.json', selected: true }, [ 'Form widgets tutorial - initial' ]),
				v('option', { value: 'dojo-test-app.project.json' }, [ 'Dojo2 Hello World' ]),
				v('option', { value: 'dojo2-todo-mvc.project.json' }, [ 'Dojo2 Todo MVC' ]),
				v('option', { value: 'dojo2-todo-mvc-tsx.project.json' }, [ 'Dojo 2 JSX Todo MVC' ]),
				v('option', { value: 'dojo2-todo-mvc-kitchensink.project.json' }, [ 'Dojo2 Kitchensink Todo MVC' ])
			]),
			v('button', { type: 'button', name: 'load-project', id: 'load-project', onclick: this._onclickLoad, disabled: isProjectLoaded ? true : false }, [ 'Load' ])
		]);

		const model = filename && isProjectLoaded && project.includes(filename) ? project.getFileModel(filename) : undefined;

		return v('div', {
			classes: 'app'
		}, [
			projectLoad,
			w(Workbench, {
				filename,
				files: isProjectLoaded ? project.getFileNames() : undefined,
				icons,
				iconsSourcePath,
				model,
				openFiles: from(this._openFiles),
				program: this._program,
				runnable: !this._compiling && isProjectLoaded && this._projectDirty,
				theme: darkTheme,

				onFileClose: this._onFileClose,
				onFileOpen: this._onFileOpen,
				onFileSelect: this._onFileSelect,
				onDirty: this._onDirty,
				onRun: this._onRun,
				onRunClick: this._onRunClick
			})
		]);
	}
}

/* Mixin a projector to the App and create an instance */
const projector = new (Projector(App))();

(async function () {
	await loadTheme(EDITOR_THEME);
	icons = await loadIcons(iconsSourcePath);
	/* Start the projector and append it to the document.body */
	projector.append();
})();
