import { v, w } from '@dojo/widget-core/d';
import WidgetBase from '@dojo/widget-core/WidgetBase';
import { ThemedMixin, ThemedProperties, theme } from '@dojo/widget-core/mixins/Themed';
import { stringify } from '../util';
import ActionBar, { ActionBarButton } from './ActionBar';
import * as css from '../styles/console.m.css';

/**
 * The type of supported log messages. We currently support:
 * * console.log
 * * console.error
 * * console.info
 * * console.warn
 */
export enum ConsoleMessageType {
	Log = 'log',
	Error = 'error',
	Info = 'info',
	Warning = 'warn'
}

export interface ConsoleMessage {
	/**
	 * The type of console message.
	 */
	type: ConsoleMessageType;
	/**
	 * The actual console message to show.
	 */
	message: any;
	/**
	 * The filename associated with the console message, if any.
	 */
	filename?: string;
	/**
	 * The line number associated with the console message, if any.
	 */
	lineNumber?: number;
}

export interface ConsoleProperties extends ThemedProperties {
	/**
	 * A list of console messages to render
	 */
	messages?: ConsoleMessage[];
	/**
	 * A callback to call when the "clear" button is triggered.
	 * Ideally, this callback clears out the passed messages.
	 */
	onClear?(): void;
}

function getLogType(type: ConsoleMessageType): string {
	return type === ConsoleMessageType.Log
		? css.log : type === ConsoleMessageType.Error
		? css.error : type === ConsoleMessageType.Info
		? css.info : css.warn;
}

const ThemedBase = ThemedMixin(WidgetBase);

interface ConsoleRowProperties extends ThemedProperties {
	key: string;
	message: ConsoleMessage;
}

@theme(css)
class ConsoleRow extends ThemedBase<ConsoleRowProperties> {
	protected render() {
		const { key, message: { message, type } } = this.properties;
		const children = (Array.isArray(message) ? message : [ message ]).map((child) => {
			return v('span', { classes: this.theme(css.logArg) }, [ stringify(child) ]);
		});
		return v('div', {
			key,
			classes: this.theme([ getLogType(type), css.consoleRow ])
		}, [
			v('span', {
				classes: this.theme(css.meta)
			}, [ v('span', { classes: this.theme(css.typeLabel) }, [ type ]) ]),
			v('span', {
				classes: this.theme(css.logBody)
			}, children)
		]);
	}
}

@theme(css)
export default class Console extends ThemedBase<ConsoleProperties> {
	private _onClearConsole = () => {
		const onClear = this.properties.onClear;
		onClear && onClear();
	}

	protected render() {
		const { messages = [], theme } = this.properties;
		const children = messages.map((message, i) => {
			return w(ConsoleRow, { theme, message, key: `message-${i}` });
		});
		return v('div', {
			classes: this.theme(css.root)
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
			}, children)
		]);
	}
}
