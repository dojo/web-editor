import { assign } from '@dojo/core/lang';
import Observable from '@dojo/core/Observable';
import Task from '@dojo/core/async/Task';
import Headers from '@dojo/core/request/Headers';
import { Provider, RequestOptions, UploadObservableTask } from '@dojo/core/request/interfaces';
import Response from '@dojo/core/request/Response';
import xhr from '@dojo/core/request/providers/xhr';

export class AMDRequireResponse extends Response {
	private _response: any;
	readonly bodyUsed = false;
	readonly data: Observable<any>;
	readonly download: Observable<number>;
	readonly headers = new Headers();
	readonly ok = true;
	readonly status = 200;
	readonly statusText = 'OK';
	readonly url: string;

	constructor(url: string, response: any) {
		super();

		this._response = response;
		this.data = new Observable<any>((observer) => {
			observer.error(new Error('Data not supported'));
		});
		this.download = new Observable<any>((observer) => {
			observer.error(new Error('Data not supported'));
		});
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

	upload(): Observable<any> {
		return new Observable<any>((observer) => {
			observer.complete(new Error('Upload not supported'));
		});
	}
}

/**
 * Returns an AMD require provider that offloads to XHR, which can be bound to a localised require
 * @param req The local require to bind to
 */
export default function getProvider(req: NodeRequire = require): Provider {
	return function amdRequire(url: string, options?: RequestOptions): UploadObservableTask<AMDRequireResponse> {
		/* we need to detect and rewrite URLs from @dojo/i18n/cldr/load - see issue https://github.com/dojo/i18n/issues/83 */
		const i18nUri = /^https:\/\/unpkg\.com\/@dojo\/i18n[^\/]*\/cldr\//i;
		const remoteUri = /^https?:\/\//i;
		if (i18nUri.test(url) || !remoteUri.test(url)) {
			const task = new Task<AMDRequireResponse>((resolve, reject) => {
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
			assign(task, {
				upload: new Observable<any>((observer) => {
					observer.complete(new Error('Upload not supported'));
				})
			});
			return task as UploadObservableTask<AMDRequireResponse>;
		}
		return xhr(url, options);
	};
}
