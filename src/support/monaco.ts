import global from '@dojo/shim/global';
import request from '@dojo/core/request';
import Projector from '@dojo/widget-core/mixins/Projector';
import { v } from '@dojo/widget-core/d';
import WidgetBase from '@dojo/widget-core/WidgetBase';
import { WidgetProperties } from '@dojo/widget-core/interfaces';

export interface ThemeJson {
	name: string;
	type: string;
	colors: { [color: string]: string };
	rules: monaco.editor.ITokenThemeRule[];
}

async function loadThemeFile(filename: string): Promise<ThemeJson> {
	return (await request(filename)).json<ThemeJson>();
}

function getEditorTheme(theme: ThemeJson): monaco.editor.IStandaloneThemeData {
	const base = theme.type === 'dark' ? 'vs-dark' : theme.type === 'hc' ? 'hc-black' : 'vs';
	const { colors, rules } = theme;
	return {
		base,
		inherit: true,
		rules,
		colors
	};
}

export class MonacoScript extends WidgetBase<WidgetProperties> {
	promise: Promise<typeof monaco>;
	private _onload: () => void;
	private _onerror: () => void;
	private readonly _proxyUrl = '../support/worker-proxy.js'; // TODO: this may not be able to be hard-coded
	private readonly _editorModuleId = 'vs/editor/editor.main';
	private readonly _loaderSrc = '../vs/loader.js'; // TODO: this may not be able to be hard-coded

	private _loadEditor: () => Promise<typeof monaco> = () => {
		return new Promise<typeof monaco>((resolve, reject) => {
			global.MonacoEnvironment = {
				getWorkerUrl: () => this._proxyUrl
			};
			if (!global.require) {
				reject(new Error('AMD require not found.'));
			}
			global.require.config({ baseUrl: '..' });
			global.require([this._editorModuleId], () => resolve(global.monaco));
		});
	}

	constructor() {
		super();
		this.promise = (new Promise<void>((resolve, reject) => {
			this._onload = () => resolve();
			this._onerror = () => reject();
		}))
		.then(this._loadEditor);
	}

	render() {
		return v('script', {
			src: this._loaderSrc,
			onload: this._onload,
			onerror: this._onerror
		});
	}
}

let projector: Projector<WidgetProperties> & MonacoScript;
export function loadMonaco(): Promise<typeof monaco> {
	if (!projector) {
		projector = new (Projector(MonacoScript))();
		projector.append();
	}

	return projector.promise;
}

export async function loadTheme(filename: string): Promise<void> {
	const theme = await loadThemeFile(filename);
	const monacoNamespace = await loadMonaco();
	monacoNamespace.editor.defineTheme(theme.name, getEditorTheme(theme));
	monacoNamespace.editor.setTheme(theme.name);
}

export default loadMonaco;
