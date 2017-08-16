import global from '@dojo/core/global';
import { createHandle } from '@dojo/core/lang';
import { queueTask } from '@dojo/core/queue';
import { debounce } from '@dojo/core/util';
import { v, w } from '@dojo/widget-core/d';
import { Constructor, VirtualDomProperties, WidgetProperties } from '@dojo/widget-core/interfaces';
import WidgetBase from '@dojo/widget-core/WidgetBase';
import { ThemeableMixin, ThemeableProperties, theme } from '@dojo/widget-core/mixins/Themeable';
import DomWrapper from '@dojo/widget-core/util/DomWrapper';
import project from './project';
import * as css from './styles/editor.m.css';

const globalMonaco: typeof monaco = global.monaco;

/**
 * @type EditorProperties
 *
 * Properties that can be set on an `Editor` widget
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

const EditorBase = ThemeableMixin(WidgetBase);

@theme(css)
export default class Editor extends EditorBase<EditorProperties> {
	private _editor: monaco.editor.IStandaloneCodeEditor | undefined;
	private _EditorDom: Constructor<WidgetBase<VirtualDomProperties & WidgetProperties>>;
	private _didChangeHandle: monaco.IDisposable;
	private _onAfterRender = () => {
		if (!this._editor) {
			this._editor = globalMonaco.editor.create(this._root, this.properties.options);
			this._didChangeHandle = this._editor.onDidChangeModelContent(debounce(this._onDidChangeModelContent, 1000));
			const { onEditorInit } = this.properties;
			this._setModel();
			onEditorInit && onEditorInit(this._editor);

			this.own(createHandle(() => {
				if (this._editor) {
					this._editor.dispose();
					this._didChangeHandle.dispose();
				}
			}));
		}
		this._editor.layout();
		this._queuedLayout = false;
		const { onEditorLayout } = this.properties;
		onEditorLayout && onEditorLayout();
	}
	private _onDidChangeModelContent = () => {
		if (this.properties.filename) {
			project.setFileDirty(this.properties.filename);
		}
	}
	private _queuedLayout = false;
	private _root: HTMLDivElement;

	private _setModel() {
		const { filename } = this.properties;
		if (this._editor && filename && project.includes(filename)) {
			this._editor.setModel(project.getFileModel(filename));
		}
	}

	constructor() {
		super();
		const root = this._root = document.createElement('div');
		root.style.height = '100%';
		root.style.width = '100%';
		this._EditorDom = DomWrapper(root);
	}

	public render() {
		/* TODO: Refactor when https://github.com/dojo/widget-core/pull/548 published */
		if (!this._queuedLayout) {
			/* doing this async, during the next major task, to allow the widget to actually render */
			this._queuedLayout = true;
			queueTask(this._onAfterRender);
		}
		this._setModel();
		/* TODO: Create single node when https://github.com/dojo/widget-core/issues/553 resolved */
		return v('div', {
			classes: this.classes(css.root)
		}, [ w(this._EditorDom, { key: 'editor' }) ]);
	}
}
