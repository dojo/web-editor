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
	/**
	 * The interval, in milliseconds, when the last change to the editor causes it to call `onDirty`.  It will default to
	 * `1000` (1 second)
	 */
	changeInterval?: number;

	/**
	 * The ID of the editor, used to determine what module to load in the runner
	 */
	id: string;

	/**
	 * The model to pass to the editor
	 */
	model?: Editor['properties']['model'];

	/**
	 * The program to pass to the runner
	 */
	program?: Program;

	/**
	 * The URI to pass to the runner to load before loading a program
	 */
	runnerSrc?: string;

	/**
	 * Called when the editor goes into a dirty state
	 */
	onDirty?(): void;
}

const ThemedBase = ThemedMixin(WidgetBase);

@theme(liveeditorCss)
export default class LiveEditor extends ThemedBase<LiveEditorProperties, null> {
	protected render() {
		const { changeInterval = 1000, id, model, program, runnerSrc: src, onDirty } = this.properties;
		const runnerProperties: RunnerProperties = assign({}, program, { key: 'runner', main: `src/${id}`, src });
		return v('div', {
			classes: [ this.theme(liveeditorCss.root), liveeditorCss.rootFixed ]
		}, [
			v('div', {
				classes: this.theme(liveeditorCss.left),
				key: 'left'
			}, [
				v('div', {}, [ 'Live Editor' ]),
				w(Editor, {
					changeInterval,
					key: 'editor',
					model,
					options: {
						lineNumbers: 'off',
						minimap: { enabled: false }
					},
					onDirty
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
