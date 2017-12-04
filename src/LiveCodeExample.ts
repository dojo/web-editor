import { v, w } from '@dojo/widget-core/d';
import { DNode } from '@dojo/widget-core/interfaces';
import WidgetBase from '@dojo/widget-core/WidgetBase';
import { theme, ThemedMixin, ThemedProperties } from '@dojo/widget-core/mixins/Themed';
import { Program } from './project';
import * as livecodeexampleCss from './styles/livecodeexample.m.css';
import LiveEditor from './widgets/LiveEditor';

export interface LiveCodeExampleProperties extends ThemedProperties {
	/**
	 * The interval, in milliseconds, when the last change to the editor causes it to call `onDirty`.  It will default to
	 * `1000` (1 second)
	 */
	changeInterval?: number;

	/**
	 * The description of the live code example
	 */
	description: DNode | DNode[];

	/**
	 * The ID of the live code example, this must be unique for the project and will be used to generate
	 * a virutal filename for the example
	 */
	id: string;

	/**
	 * The model of the virtual file used by the editor
	 */
	model?: monaco.editor.IModel;

	/**
	 * The program that will be passed to the runner
	 */
	program?: Program;

	/**
	 * The URI to load in the runner before a program is loaded
	 */
	runnerSrc?: string;

	/**
	 * The title of the example
	 */
	title: DNode | DNode[];

	/**
	 * A flag to determine if the example should be treated as a `.tsx` file, defaults to just `.ts`
	 */
	tsx?: boolean;

	/**
	 * A callback that is called when the code example changes to a dirty state
	 */
	onDirty?(id: string): void;
}

const isArray = Array.isArray;
const DIV = 'div';

const ThemedBase = ThemedMixin(WidgetBase);

@theme(livecodeexampleCss)
export default class LiveCodeExample extends ThemedBase<LiveCodeExampleProperties, string> {
	private _onDirty = () => {
		const { id, onDirty } = this.properties;
		onDirty && onDirty(id);
	}

	public render() {
		const {
			_onDirty: onDirty,
			properties: { changeInterval = 1000, id, description, model, program, runnerSrc, title }
		} = this;

		return v(DIV, {
			classes: [ this.theme(livecodeexampleCss.root), livecodeexampleCss.rootFixed ],
			id,
			key: 'root'
		}, [
			v(DIV, {
				classes: this.theme(livecodeexampleCss.left),
				key: 'left'
			}, [
				v('h1', {}, isArray(title) ? title : [ title ]),
				v(DIV, {
					classes: this.theme(livecodeexampleCss.description)
				}, [
					v('p', {}, isArray(description) ? description : [ description ])
				])
			]),
			v(DIV, {
				classes: this.theme(livecodeexampleCss.right),
				key: 'right'
			}, [
				w(LiveEditor, {
					changeInterval,
					id,
					model,
					program,
					runnerSrc,
					onDirty
				})
			])
		]);
	}
}
