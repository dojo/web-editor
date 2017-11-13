import { v } from '@dojo/widget-core/d';
import WidgetBase from '@dojo/widget-core/WidgetBase';
import { WidgetProperties } from '@dojo/widget-core/interfaces';
import { ThemedMixin, ThemedProperties, theme } from '@dojo/widget-core/mixins/Themed';
import { stringify } from '../util';
import * as css from '../styles/console.m.css';

export enum ConsoleMessageType {
	Log = 'log',
	Error = 'error',
	Info = 'info',
	Warning = 'warn'
}

export interface ConsoleMessage {
	type: ConsoleMessageType;
	args: any[];
}

export interface ConsoleProperties extends WidgetProperties, ThemedProperties {
	messages?: ConsoleMessage[];
	onClear?(): void;
}

function getLogType(type: ConsoleMessageType): string {
	return type === ConsoleMessageType.Log
		? css.log : type === ConsoleMessageType.Error
		? css.error : type === ConsoleMessageType.Info
		? css.info : css.warn;
}

const ThemedBase = ThemedMixin(WidgetBase);

@theme(css)
export default class Console extends ThemedBase<ConsoleProperties> {
	private _renderMessage(type: ConsoleMessageType, args: any[] = [], key: number) {
		return v(`div`, {
			key,
			classes: this.theme(getLogType(type))
		}, [
			v('span', {
				classes: this.theme([ css.logType, getLogType(type) ])
			}, [`${type}`]),
			v('span', {}, [ args.map((arg) => stringify(arg)).join(', ') ])
		]);
	}

	render() {
		const { messages = [] } = this.properties;
		return v('div', {
			classes: [ this.theme(css.root), css.rootFixed ],
			key: 'root'
		}, messages.map(({type, args}, i) => this._renderMessage(type, args, i)));
	}
}
