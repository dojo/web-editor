import Task from '@dojo/core/async/Task';
import xhr from '@dojo/core/request/providers/xhr';
import Headers from '@dojo/core/request/Headers';
import Response from '@dojo/core/request/Response';
import { RequestOptions } from '@dojo/core/request/interfaces';

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

	xml(): Task<Document> {
		return Task.reject(new Error('XML not supported'));
	}
}

/**
 * When requesting local resources, use `require()` to retrieve them, assuming they have been made available as
 * modules in a bundle or pre-cached in the AMD loader.
 * @param url The URL to request
 * @param options Any request options
 */
export default function amdRequire(url: string, options?: RequestOptions): Task<AMDRequireResponse> {
	/* we need to detect and rewrite URLs from @dojo/i18n/cldr/load - see issue https://github.com/dojo/i18n/issues/83 */
	const i18nUri = /^https:\/\/unpkg\.com\/@dojo\/i18n[^\/]*\/cldr\//i;
	const remoteUri = /^https?:\/\//i;
	if (i18nUri.test(url) || !remoteUri.test(url)) {
		return new Task<AMDRequireResponse>((resolve, reject) => {
			const mid = url.replace(i18nUri, 'src/');
			try {
				require([ mid ], (module) => resolve(new AMDRequireResponse(mid, module)));
			}
			catch (e) {
				reject(e);
			}
		});
	}
	return xhr(url, options);
}
