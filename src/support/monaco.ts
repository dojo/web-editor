import global from '@dojo/shim/global';
import request from '@dojo/core/request';
import Projector from '@dojo/widget-core/mixins/Projector';
import WidgetBase from '@dojo/widget-core/WidgetBase';
import { WidgetProperties } from '@dojo/widget-core/interfaces';
import { v } from '@dojo/widget-core/d';

export type Monaco = typeof monaco;

export interface ThemeJson {
	name: string;
	type: string;
	colors: { [color: string]: string };
	rules: monaco.editor.ITokenThemeRule[];
}

export interface MonacoConfig {
	basePath?: string;
	editorModuleId?: string;
	loaderPath?: string;
	proxyPath?: string;
}

export interface MonacoScriptProperties extends MonacoConfig, WidgetProperties {
	onLoad?(monaco: Monaco): void;
	onError?(error: any): void;
}

class MonacoScript extends WidgetBase<MonacoScriptProperties> {
	promise: Promise<void>;
	private _onload: () => void;
	private _onerror: (error: any) => void;

	protected _loadEditor: () => void = () => {
		return new Promise<Monaco>((resolve, reject) => {
			const {
				onLoad = () => {},
				onError = () => {},
				basePath,
				editorModuleId,
				proxyPath
			} = this.properties;
			global.MonacoEnvironment = {
				getWorkerUrl: () => proxyPath
			};

			if (!global.require) {
				const error = new Error('AMD require not found');
				onError(error);
				reject(error);
				return;
			}

			global.require.config({ baseUrl: basePath });
			global.require([editorModuleId], () => {
				const { monaco } = global;
				resolve(monaco);
				onLoad(monaco);
			});
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
		const { loaderPath, onError = () => {} } = this.properties;
		return v('script', {
			src: loaderPath,
			onload: this._onload,
			onerror: (error: any) => {
				this._onerror(error);
				onError(error);
			}
		});
	}
}

let promise: Promise<Monaco>;

export function loadMonaco(config?: MonacoConfig): Promise<Monaco> {
	if (!promise) {
		promise = new Promise((resolve, reject) => {
			const projector = new (Projector(MonacoScript))();
			projector.setProperties({
				onLoad: resolve,
				onError: reject,
				basePath: '..',
				proxyPath: '../support/worker-proxy.js',
				loaderPath: '../vs/loader.js',
				editorModuleId: 'vs/editor/editor.main',
				...config
			});
			projector.append();
		});
	}

	return promise;
}

export default loadMonaco;

export function getMonaco(): Promise<Monaco> {
	if (!promise) {
		console.warn('Monaco not loaded yet. call loadMonaco to initialize before required');
	}
	return Promise.resolve(promise);
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

export async function loadTheme(filename: string): Promise<void> {
	const theme = await loadThemeFile(filename);
	const themeName = theme.name;
	const monaco = await getMonaco();
	monaco.editor.defineTheme(themeName, getEditorTheme(theme));
	monaco.editor.setTheme(themeName);
}
