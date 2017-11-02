import 'vs/editor/editor.main'; /* imported for side-effects */

import { assign } from '@dojo/shim/object';
import { v, w } from '@dojo/widget-core/d';
import WidgetBase from '@dojo/widget-core/WidgetBase';
import { ThemeableMixin, ThemeableProperties, theme } from '@dojo/widget-core/mixins/Themeable';
import { Program } from './project';
import * as liveeditorCss from './styles/liveeditor.m.css';
import Editor from './widgets/Editor';
import Runner, { RunnerProperties } from './widgets/Runner';

export interface LiveEditorProperties extends ThemeableProperties {
	id: string;
	program?: Program;
	tsx?: boolean;

	onChange?(value: string): void;
}

const ThemeableBase = ThemeableMixin(WidgetBase);

@theme(liveeditorCss)
export default class LiveEditor extends ThemeableBase<LiveEditorProperties, string> {
	private _model: Editor['properties']['model'];
	private _cachedChildren: string;

	private _onDirty() {
		const { _model, properties: { onChange } } = this;
		if (_model && onChange) {
			onChange(_model.getValue());
		}
	}

	public render() {
		const { properties: { id, program, tsx } } = this;
		const children = this.children.join(`\n`);
		if (children !== this._cachedChildren) {
			this._cachedChildren = children;
			if (!this._model) {
				const uri = monaco.Uri.file(`./src/${id}.${tsx ? 'tsx' : 'ts' }`);
				this._model = monaco.editor.getModel(uri) || monaco.editor.createModel(children, 'typescript', uri);
			}
			this._model.setValue(children);
		}
		const runnerProperties: RunnerProperties = assign({}, program, { key: 'runner', main: `src/${id}` });
		return v('div', {
			classes: this.classes(liveeditorCss.root).fixed(liveeditorCss.rootFixed)
		}, [
			v('div', {
				classes: this.classes(liveeditorCss.left),
				key: 'left'
			}, [
				v('div', {}, [ 'Live Editor' ]),
				w(Editor, {
					key: 'editor',
					model: this._model,
					options: {
						lineNumbers: 'off',
						minimap: { enabled: false }
					},
					onDirty: this._onDirty
				})
			]),
			v('div', {
				classes: this.classes(liveeditorCss.right),
				key: 'right'
			}, [
				v('div', {}, [ 'Result' ]),
				w(Runner, runnerProperties)
			])
		]);
	}
}
