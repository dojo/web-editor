import { v, w } from '@dojo/widget-core/d';
import WidgetBase from '@dojo/widget-core/WidgetBase';
import { WidgetProperties } from '@dojo/widget-core/interfaces';
import { ThemedMixin, ThemedProperties, theme } from '@dojo/widget-core/mixins/Themed';
import { stringify } from '../util';
import ActionBar, { ActionBarButton } from './ActionBar';
import * as css from '../styles/console.m.css';

export enum ConsoleMessageType {
	Log = 'log',
	Error = 'error',
	Info = 'info',
	Warning = 'warn'
}

export interface ConsoleMessage {
	type: ConsoleMessageType;
	message: any | any[];
	filename?: string;
	lineNumber?: number;
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

export interface ConsoleRowProperties extends WidgetProperties, ThemedProperties {
	key: string;
	message: ConsoleMessage;
}

@theme(css)
export class ConsoleRow extends ThemedBase<ConsoleRowProperties> {
	render() {
		const { key, message: { message, type } } = this.properties;
		const args = Array.isArray(message) ? message : [ message ];
		return v('div', {
			key,
			classes: this.theme([ getLogType(type), css.consoleRow ])
		}, [
			v('span', {
				classes: this.theme(css.meta)
			}, [ v('span', { classes: this.theme(css.typeLabel) }, [ type]) ]),
			v('span', {
				classes: this.theme(css.logBody)
			}, [ ...args.map((arg) => v('span', { classes: this.theme(css.logArg) }, [ stringify(arg) ])) ])
		]);
	}
}

@theme(css)
export default class Console extends ThemedBase<ConsoleProperties> {
	private _onClearConsole = () => {
		const onClear = this.properties.onClear;
		onClear && onClear();
	}

	render() {
		const { messages = [], theme } = this.properties;
		return v('div', {
			classes: [ this.theme(css.root), css.rootFixed ]
		}, [
			w(ActionBar, {
				label: 'Console Actions',
				theme,
				key: 'consoleActions'
			}, [
				w(ActionBarButton, {
					key: 'clearConsole',
					label: 'Clear Console',
					iconClass: css.clearConsoleIcon,
					onClick: this._onClearConsole
				})
			]),
			v('div', {
				key: 'messageContainer',
				classes: this.theme(css.messageContainer)
			}, messages.map((message, i) => w(ConsoleRow, { theme, message, key: `message-${i}` })))
		]);
	}
}
