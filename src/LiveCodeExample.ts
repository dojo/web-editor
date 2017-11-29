import { v, w } from '@dojo/widget-core/d';
import { WidgetProperties } from '@dojo/widget-core/interfaces';
import WidgetBase from '@dojo/widget-core/WidgetBase';
import { theme, ThemedMixin } from '@dojo/widget-core/mixins/Themed';
import project, { Program } from './project';
import * as livecodeexampleCss from './styles/livecodeexample.m.css';
import LiveEditor from './widgets/LiveEditor';

interface LiveCodeExampleProperties extends WidgetProperties {
	id: string;
	title: string;
	tsx?: boolean;
	description: string;
}

const ThemedBase = ThemedMixin(WidgetBase);

@theme(livecodeexampleCss)
export default class LiveCodeExample extends ThemedBase<LiveCodeExampleProperties, string> {
	private _program: Program | undefined;

	private async _onChange() {
		this._program = await project.getProgram();
		this.invalidate();
	}

	public render() {
		const { _program: program, properties: { id, description, theme, title } } = this;
		return v('div', {
			classes: [ this.theme(livecodeexampleCss.root), livecodeexampleCss.rootFixed ],
			id,
			key: 'root'
		}, [
			v('div', {
				classes: this.theme(livecodeexampleCss.left)
			}, [
				v('h1', {}, [ title ]),
				v('div', {
					classes: this.theme(livecodeexampleCss.description)
				}, [
					v('p', {}, [ description ])
				])
			]),
			v('div', {
				classes: this.theme(livecodeexampleCss.right)
			}, [
				w(LiveEditor, {
					id,
					program,
					theme,
					onChange: this._onChange
				})
			])
		]);
	}
}
