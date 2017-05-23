import global from '@dojo/core/global';
import { createHandle } from '@dojo/core/lang';
import { queueTask } from '@dojo/core/queue';
import { debounce } from '@dojo/core/util';
import { v } from '@dojo/widget-core/d';
import { DNode, WidgetProperties } from '@dojo/widget-core/interfaces';
import WidgetBase, { afterRender } from '@dojo/widget-core/WidgetBase';
import { ThemeableMixin, ThemeableProperties, theme } from '@dojo/widget-core/mixins/Themeable';
import project from './project';
import * as css from './styles/editor.m.css';

const globalMonaco: typeof monaco = global.monaco;

/**
 * @type EditorProperties
 *
 * Properties that can be set on Editor widget
 *
 * @property filename The filename (from the current `project`) that the editor should be displaying for editing
 * @property options Editor options that should be passed to the monaco editor when it is created
 * @property onEditorInit Called when the monaco editor is created and initialized by the widget, passing the instance of the monaco editor
 * @property onEditorLayout Called when the widget calls `.layout()` on the monaco editor
 */
export interface EditorProperties extends WidgetProperties, ThemeableProperties {
	filename?: string;
	options?: monaco.editor.IEditorOptions;

	onEditorInit?(editor: monaco.editor.IStandaloneCodeEditor): void;
	onEditorLayout?(): void;
}

/* tslint:disable:variable-name */
const EditorBase = ThemeableMixin(WidgetBase);
/* tslint:enable:variable-name */

@theme(css)
export default class Editor extends EditorBase<EditorProperties> {
	private _editor: monaco.editor.IStandaloneCodeEditor;
	private _didChangeHandle: monaco.IDisposable;
	private _onDidChangeModelContent = () => {
		if (this.properties.filename) {
			project.setFileDirty(this.properties.filename);
		}
	}
	private _queuedLayout = false;

	private _initEditor(element: HTMLDivElement) {
		/* doing this async, during next macro task to help ensure the editor does a proper layout */
		queueTask(() => {
			this._editor = globalMonaco.editor.create(element, this.properties.options);
			this._didChangeHandle = this._editor.onDidChangeModelContent(debounce(this._onDidChangeModelContent, 1000));
			const { onEditorInit } = this.properties;
			onEditorInit && onEditorInit(this._editor);

			this.own(createHandle(() => {
				this._editor.dispose();
				this._didChangeHandle.dispose();
			}));
		});
	}

	public render() {
		return v('div', {
			afterCreate: this._initEditor,
			afterUpdate: this.updateEditor as any,
			classes: this.classes(css.base)
		});
	}

	@afterRender()
	public updateEditor(node?: DNode): DNode | undefined {
		if (!this._editor) {
			return node;
		}
		if (this.properties.filename && project.includes(this.properties.filename)) {
			this._editor.setModel(project.getFileModel(this.properties.filename));
		}
		if (!this._queuedLayout) {
			this._queuedLayout = true;
			queueTask(() => {
				this._editor.layout();
				this._queuedLayout = false;
				const { onEditorLayout } = this.properties;
				onEditorLayout && onEditorLayout();
			});
		}
		return node;
	}
}
