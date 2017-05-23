import Task from '@dojo/core/async/Task';
import Headers from '@dojo/core/request/Headers';
import { Provider, RequestOptions } from '@dojo/core/request/interfaces';
import Response from '@dojo/core/request/Response';
import xhr from '@dojo/core/request/providers/xhr';

export class AMDRequireResponse extends Response {
	private _response: any;
	readonly bodyUsed = false;
	readonly headers: Headers;
	readonly ok: boolean;
	readonly status: number;
	readonly statusText: string;
	readonly url: string;

	constructor(url: string, response: any) {
		super();

		this._response = response;
		this.headers = new Headers();
		this.ok = true;
		this.status = 200;
		this.statusText = 'OK';
		this.url = (<any> require).toUrl(url);
	}

	arrayBuffer(): Task<ArrayBuffer> {
		return Task.reject<ArrayBuffer>(new Error('ArrayBuffer not supported'));
	}

	blob(): Task<Blob> {
		return Task.reject(new Error('Blob not supported'));
	}

	formData(): Task<FormData> {
		return Task.reject(new Error('FormData not supported'));
	}

	json(): Task<any> {
		return Task.resolve(typeof this._response === 'string' ? JSON.parse(this._response) : this._response);
	}

	text(): Task<string> {
		return Task.resolve(typeof this._response === 'string' ? this._response : this._response && this._response.toString());
	}
}

/**
 * Returns an AMD require provider that offloads to XHR, which can be bound to a localised require
 * @param req The local require to bind to
 */
export default function getProvider(req: NodeRequire = require): Provider {
	return function amdRequire(url: string, options?: RequestOptions): Task<AMDRequireResponse> {
		/* we need to detect and rewrite URLs from @dojo/i18n/cldr/load - see issue https://github.com/dojo/i18n/issues/83 */
		const i18nUri = /^https:\/\/unpkg\.com\/@dojo\/i18n[^\/]*\/cldr\//i;
		const remoteUri = /^https?:\/\//i;
		if (i18nUri.test(url) || !remoteUri.test(url)) {
			return new Task<AMDRequireResponse>((resolve, reject) => {
				const mid = url.replace(i18nUri, 'src/');
				try {
					(req as any)([ mid ], (module: any) => {
						resolve(new AMDRequireResponse(mid, module));
					});
				}
				catch (e) {
					reject(e);
				}
			});
		}
		return xhr(url, options);
	};
}
