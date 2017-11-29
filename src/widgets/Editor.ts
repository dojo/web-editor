import { queueTask } from '@dojo/core/queue';
import { debounce } from '@dojo/core/util';
import { w } from '@dojo/widget-core/d';
import WidgetBase from '@dojo/widget-core/WidgetBase';
import { ThemedMixin, ThemedProperties, theme } from '@dojo/widget-core/mixins/Themed';
import DomWrapper from '@dojo/widget-core/util/DomWrapper';

import * as css from '../styles/editor.m.css';

/**
 * The minimum width we should ever display the monaco-editor;
 */
const MINIMUM_WIDTH = 150;

/**
 * Properties that can be set on an `Editor` widget
 */
export interface EditorProperties extends ThemedProperties {
	/**
	 * Ensure that monaco-editor instance is layed out in a way that allows the document to reflow and resize the editor properly
	 */
	layout?: boolean;

	/**
	 * The monaco-editor _model_ (file) that is displayed in the editor
	 */
	model?: monaco.editor.IModel;

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

/**
 * Internal interface to represent sizes
 */
interface Size {
	height: number;
	width: number;
}

/**
 * Return the size of an `HTMLElement`
 * @param target The target `HTMLElement`
 */
function getSize(target: HTMLElement): Size {
	const { clientHeight: height, clientWidth: width } = target;
	return { height, width };
}

/**
 * Compare the two sizes and return `true` if they are equal, otherwise `false`
 * @param a The first size to compare
 * @param b The second size to compare
 */
function isEqualSize(a: Size, b: Size): boolean {
	return a.height === b.height && a.width === b.width;
}

const ThemedBase = ThemedMixin(WidgetBase);

/**
 * A class which wraps the `monaco-editor`
 */
@theme(css)
export default class Editor extends ThemedBase<EditorProperties> {
	private _currentModel: monaco.editor.IModel | undefined;
	private _editor: monaco.editor.IStandaloneCodeEditor | undefined;
	private _EditorDom: DomWrapper;
	private _didChangeHandle: monaco.IDisposable;
	private _originalSize: Size;
	private _editorRoot: HTMLDivElement;

	private _layout() {
		const { _editor, _originalSize, _editorRoot, properties: { onLayout } } = this;
		if (!_editor) {
			return;
		}

		// If we are currently not at our original size, we will restore it, so that it won't interfere with the layout
		// of other elements
		if (!isEqualSize(getSize(_editorRoot), _originalSize)) {
			_editor.layout({ height: _originalSize.height, width: MINIMUM_WIDTH });
		}

		// Now at the end of the turn, we need to do the layout of the editor properly
		queueTask(() => {
			const size = getSize(_editorRoot);
			if (!isEqualSize(size, { height: _originalSize.height, width: MINIMUM_WIDTH })) {
				_editor.layout(size);
				onLayout && onLayout();
			}
		});
	}

	private _onDidChangeModelContent = () => {
		const { onDirty } = this.properties;
		onDirty && onDirty();
	}

	constructor() {
		super();
		const root = this._editorRoot = document.createElement('div');
		this._EditorDom = DomWrapper(root);
	}

	protected onAttach() {
		const { _onDidChangeModelContent, _editorRoot, properties: { model, onInit, onLayout, options } } = this;
		// _onAttached fires when the DOM is actually attached to the document, but the rest of the virtual DOM hasn't
		// been layed out which causes issues for monaco-editor when figuring out its initial size, so we will schedule
		// it to be run at the end of the turn, which will provide more reliable layout
		queueTask(() => {
			const editor = this._editor = monaco.editor.create(_editorRoot, options);
			this._didChangeHandle = editor.onDidChangeModelContent(debounce(_onDidChangeModelContent, 1000));
			onInit && onInit(editor);

			this._originalSize = getSize(_editorRoot);
			editor.layout();
			onLayout && onLayout();
			if (model) {
				editor.setModel(model);
			}
		});
	}

	protected onDetach() {
		if (this._editor) {
			this._editor.dispose();
		}
		if (this._didChangeHandle) {
			this._didChangeHandle.dispose();
		}
	}

	protected render() {
		const { _currentModel, _editor, properties: { model } } = this;
		// getting the monaco-editor to layout and not interfere with the layout of other elements is a complicated affair
		// we have to do some quite obstuse logic in order for it to behave properly, but only do so if we suspect the
		// root node might resize after the render
		if (this.properties.layout) {
			this._layout();
		}

		// display the _model_ (file) in the editor
		// re-renders fire a lot more often then model changes, so caching it for performance reasons
		if (_editor && model && _currentModel !== model) {
			_editor.setModel(model);
			this._currentModel = model;
		}

		// displaying a model can be an issue, so we are going to hide the editor when there is no valid model
		const hasModel = model && model.uri.toString().match(/^file:\/{2}/);

		return w(this._EditorDom, {
			classes: [ this.theme(css.root), css.rootFixed, hasModel ? null : css.hide ],
			key: 'root'
		});
	}
}
