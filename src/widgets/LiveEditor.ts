import 'vs/editor/editor.main'; /* imported for side-effects */

import { assign } from '@dojo/shim/object';
import { v, w } from '@dojo/widget-core/d';
import WidgetBase from '@dojo/widget-core/WidgetBase';
import { ThemeableMixin, ThemeableProperties, theme } from '@dojo/widget-core/mixins/Themeable';
import Editor from './Editor';
import Runner, { RunnerProperties } from './Runner';
import { Program } from '../project';
import * as liveeditorCss from '../styles/liveeditor.m.css';

export interface LiveEditorProperties extends ThemeableProperties {
	id: string;
	model?: Editor['properties']['model'];
	program?: Program;

	onChange?(): void;
}

const ThemeableBase = ThemeableMixin(WidgetBase);

@theme(liveeditorCss)
export default class LiveEditor extends ThemeableBase<LiveEditorProperties, null> {
	private _onDirty() {
		const { onChange } = this.properties;
		onChange && onChange();
	}

	public render() {
		const { id, model, program } = this.properties;
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
					model,
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
