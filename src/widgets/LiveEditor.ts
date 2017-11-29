import 'vs/editor/editor.main'; /* imported for side-effects */

import { assign } from '@dojo/shim/object';
import { v, w } from '@dojo/widget-core/d';
import WidgetBase from '@dojo/widget-core/WidgetBase';
import { ThemedMixin, ThemedProperties, theme } from '@dojo/widget-core/mixins/Themed';
import Editor from './Editor';
import Runner, { RunnerProperties } from './Runner';
import { Program } from '../project';
import * as liveeditorCss from '../styles/liveeditor.m.css';

export interface LiveEditorProperties extends ThemedProperties {
	id: string;
	model?: Editor['properties']['model'];
	program?: Program;

	onChange?(): void;
}

const ThemedBase = ThemedMixin(WidgetBase);

@theme(liveeditorCss)
export default class LiveEditor extends ThemedBase<LiveEditorProperties, null> {
	private _onDirty() {
		const { onChange } = this.properties;
		onChange && onChange();
	}

	public render() {
		const { id, model, program } = this.properties;
		const runnerProperties: RunnerProperties = assign({}, program, { key: 'runner', main: `src/${id}` });
		return v('div', {
			classes: [ this.theme(liveeditorCss.root), liveeditorCss.rootFixed ]
		}, [
			v('div', {
				classes: this.theme(liveeditorCss.left),
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
				classes: this.theme(liveeditorCss.right),
				key: 'right'
			}, [
				v('div', {}, [ 'Result' ]),
				w(Runner, runnerProperties)
			])
		]);
	}
}
