import { from } from '@dojo/shim/array';
import Set from '@dojo/shim/Set';
import WidgetBase from '@dojo/widget-core/WidgetBase';
import Projector from '@dojo/widget-core/mixins/Projector';
import loadMonaco, { loadTheme } from './support/monaco';
import { v, w } from '@dojo/widget-core/d';
import project, { Program } from './project';
import Workbench from './Workbench';
import { IconJson, load as loadIcons } from './support/icons';
import darkTheme from './themes/dark/theme';
import { Request } from '@dojo/routing/interfaces';
import { startGistRouter, GistParameters } from './routing';

// Project paths
const PROJECTS_PATH = './projects';
const EDITOR_THEME = './data/editor-dark.json';
const iconsSourcePath = './extensions/vscode-material-icon-theme/out/src/material-icons.json';

let icons: IconJson;

class App extends WidgetBase {
	private _compiling = false;
	private _editorFilename = '';
	private _openFiles = new Set<string>();
	private _program: Program | undefined;
	private _projectDirty = true;

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

	private _onDirty() {
		this._projectDirty = true;
		this.invalidate();
	}

	private _onRun() {
		this._compiling = false;
		this.invalidate();
	}

	private async _onRunClick() {
		if (this._compiling || !project.isLoaded() || !this._projectDirty) {
			return;
		}
		console.log('Compiling project...');
		this._compiling = true;
		this.invalidate();
		try {
			const program = await project.getProgram();
			this._program = program;
			this._projectDirty = false;
			this.invalidate();
		} catch (err) {
			console.error(err);
		}
	}

	private _onGist = async (request: Request<any, GistParameters>) => {
		const id = request.params.id;
		console.log('onGist running', id);
		try {
			await project.load(`${PROJECTS_PATH}/${id}`);
			console.log('Project loaded');
			this.invalidate();
		} catch (err) {
			console.error(err);
		}
	}

	private async _init() {
		await loadMonaco();
		startGistRouter({
			onRoot: () => {},
			onGist: this._onGist
		});
	}

	constructor() {
		super();
		this._init();
	}

	protected render() {
		const isProjectLoaded = project.isLoaded();
		const filename = this._editorFilename;
		const files = isProjectLoaded ? project.getFileNames() : undefined;
		const model = filename && isProjectLoaded && project.includes(filename) ? project.getFileModel(filename) : undefined;

		return v('div', { classes: 'app' }, [
			isProjectLoaded ? w(Workbench, {
				filename,
				files,
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
			}) : undefined
		]);
	}
}

const projector = new (Projector(App))();
projector.append();

(async function () {
	await loadTheme(EDITOR_THEME);
	icons = await loadIcons(iconsSourcePath);
})();
