import global from '@dojo/core/global';
import { createHandle } from '@dojo/core/lang';
import { queueTask } from '@dojo/core/queue';
import { debounce } from '@dojo/core/util';
import { w } from '@dojo/widget-core/d';
import { WidgetProperties } from '@dojo/widget-core/interfaces';
import WidgetBase from '@dojo/widget-core/WidgetBase';
import { ThemeableMixin, ThemeableProperties, theme } from '@dojo/widget-core/mixins/Themeable';
import DomWrapper from '@dojo/widget-core/util/DomWrapper';
import project from './project';
import * as css from './styles/editor.m.css';

/**
 * The minimum width we should ever display the monaco-editor;
 */
const MINIMUM_WIDTH = 150;
const globalMonaco: typeof monaco = global.monaco;

/**
 * Properties that can be set on an `Editor` widget
 */
export interface EditorProperties extends WidgetProperties, ThemeableProperties {
	/**
	 * The filename to display in the editor
	 */
	filename?: string;

	/**
	 * Ensure that monaco-editor instance is layed out in a way that allows the document to reflow and resize the editor properly
	 */
	layout?: boolean;

	/**
	 * Options to pass to the monaco-editor on creation
	 */
	options?: monaco.editor.IEditorOptions;

	/**
	 * Called when the monaco-editor updates a project file
	 */
	onDirty?(): void;

	/**
	 * Called when the monaco-editor is being created and inited
	 */
	onInit?(editor: monaco.editor.IStandaloneCodeEditor): void;

	/**
	 * Called when the moanco-editor is layed out
	 */
	onLayout?(): void;
}

interface Size {
	height: number;
	width: number;
}

function getSize(element: HTMLElement): Size {
	const { clientHeight: height, clientWidth: width } = element;
	return { height, width };
}

function isEqualSize(a: Size, b: Size): boolean {
	return a.height === b.height && a.width === b.width;
}

const EditorBase = ThemeableMixin(WidgetBase);

@theme(css)
export default class Editor extends EditorBase<EditorProperties> {
	private _currentModel: monaco.editor.IModel;
	private _editor: monaco.editor.IStandaloneCodeEditor | undefined;
	private _emptyModel = monaco.editor.createModel('');
	private _EditorDom: DomWrapper;
	private _didChangeHandle: monaco.IDisposable;
	private _originalSize: Size;
	private _root: HTMLDivElement;

	private _layout() {
		const { _editor, _originalSize, _root, properties: { onLayout } } = this;
		if (!_editor) {
			return;
		}

		// If we are currently not at our original size, we will restore it, so that it won't interfere with the layout
		// of other elements
		if (!isEqualSize(getSize(_root), _originalSize)) {
			_editor.layout({ height: _originalSize.height, width: MINIMUM_WIDTH });
		}

		// Now at the end of the turn, we need to do the layout of the editor properly
		queueTask(() => {
			const size = getSize(_root);
			if (!isEqualSize(size, { height: _originalSize.height, width: MINIMUM_WIDTH })) {
				_editor.layout(size);
				onLayout && onLayout();
			}
		});
	}

	private _onAttached = () => {
		const { _onDidChangeModelContent, _root, properties: { onInit, onLayout, options } } = this;
		// _onAttached fires when the DOM is actually attached to the document, but the rest of the virtual DOM hasn't
		// been layed out which causes issues for monaco-editor when figuring out its initial size, so we will schedule
		// it to be run at the end of the turn, which will provide more reliable layout
		queueTask(() => {
			const editor = this._editor = globalMonaco.editor.create(_root, options);
			const didChangeHandle = this._didChangeHandle = editor.onDidChangeModelContent(debounce(_onDidChangeModelContent, 1000));
			this._setModel();
			onInit && onInit(editor);

			this.own(createHandle(() => {
				editor.dispose();
				didChangeHandle.dispose();
			}));
			this._originalSize = getSize(_root);
			editor.layout();
			onLayout && onLayout();
		});
	}

	private _onDidChangeModelContent = () => {
		const { filename, onDirty } = this.properties;
		if (filename) {
			project.setFileDirty(filename);
			onDirty && onDirty();
		}
	}

	private _setModel() {
		const { _editor, _emptyModel, properties: { filename } } = this;
		if (_editor && filename && project.includes(filename)) {
			const fileModel = project.getFileModel(filename);
			if (fileModel !== this._currentModel) {
				_editor.setModel(fileModel);
				this._currentModel = fileModel;
			}
		}
		else if (_editor && filename === '' && this._currentModel !== _emptyModel) {
			_editor.setModel(_emptyModel);
			this._currentModel = _emptyModel;
		}
	}

	constructor() {
		super();
		const root = this._root = document.createElement('div');
		this._EditorDom = DomWrapper(root, { onAttached: this._onAttached });
	}

	public render() {
		// getting the monaco-editor to layout and not interfere with the layout of other elements is a complicated affair
		// we have to do some quite obstuse logic in order for it to behave properly, but only do so if we suspect the
		// root node might resize after the render
		if (this.properties.layout) {
			this._layout();
		}

		// Ensure we are displaying the correct file
		this._setModel();

		return w(this._EditorDom, {
			classes: this.classes(css.root).fixed(css.rootFixed),
			key: 'root'
		});
	}
}
