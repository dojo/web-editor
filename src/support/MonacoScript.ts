import global from '@dojo/shim/global';
import WidgetBase from '@dojo/widget-core/WidgetBase';
import { WidgetProperties } from '@dojo/widget-core/interfaces';
import { v } from '@dojo/widget-core/d';

export default class MonacoScript extends WidgetBase<WidgetProperties> {
	promise: Promise<typeof monaco>;
	private _onload: () => void;
	private _onerror: () => void;
	private readonly _proxyUrl = '../support/worker-proxy.js'; // TODO: this may not be able to be hard-coded
	private readonly _editorModuleId = 'vs/editor/editor.main';
	private readonly _loaderSrc = '../vs/loader.js'; // TODO: this may not be able to be hard-coded

	/* istanbul ignore next */
	protected _loadEditor: () => Promise<typeof monaco> = () => {
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
