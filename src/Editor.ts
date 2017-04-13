import Destroyable from '@dojo/core/Destroyable';
import { createHandle } from '@dojo/core/lang';
import { debounce } from '@dojo/core/util';
import project from './project';

/**
 * A class which is a simple abstraction of the `monaco-editor` editor
 */
export default class Editor extends Destroyable {
	private _currentFile: string;
	private _editor: monaco.editor.IStandaloneCodeEditor;

	private _onDidChangeModelContent = () => {
		project.setFileDirty(this._currentFile);
	}

	/**
	 * A class which is a simple abstraction of the `monaco-editor` editor
	 * @param element The root HTML element to attach the editor to
	 */
	constructor (element: HTMLElement, options?: monaco.editor.IEditorOptions) {
		super();

		this._editor = monaco.editor.create(element, options);
		const didChangeHandle = this._editor.onDidChangeModelContent(debounce(this._onDidChangeModelContent, 1000));

		this.own(createHandle(() => {
			this._editor.dispose();
			didChangeHandle.dispose();
		}));
	}

	/**
	 * Display a file in the editor from the currently loaded project
	 * @param model The model to display
	 */
	display(filename: string): void {
		if (!project.includes(filename)) {
			throw new Error(`File "${filename}" is not part of the project.`);
		}
		this._currentFile = filename;
		this._editor.setModel(project.getFileModel(filename));
	}
}
