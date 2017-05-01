import Task from '@dojo/core/async/Task';
import request, { Headers } from '@dojo/core/request';
import { Response, ResponseEvents } from '@dojo/core/request/interfaces';
import Map from '@dojo/shim/Map';
import { Handle } from '@dojo/interfaces/core';
import { Evented, EventedListenerOrArray } from '@dojo/interfaces/bases';

export const responseMap = new Map<string, any>();

interface StubResponseOptions {
	response: any;
	ok?: boolean;
	status?: number;
	statusText?: string;
}

export class ResponseStub implements Response {
	private _response: any;
	readonly bodyUsed = false;
	readonly headers: Headers;
	readonly ok: boolean;
	readonly status: number;
	readonly statusText: string;
	readonly url: string;

	on = function(type: string, handler: EventedListenerOrArray<Evented, any>): Handle {
		return {
			destroy() { }
		};
	} as ResponseEvents;

	constructor(url: string, { response, ok = true, status = 200, statusText = 'OK' }: StubResponseOptions) {
		this._response = response;
		this.headers = new Headers();
		this.ok = ok;
		this.status = status;
		this.statusText = statusText;
		this.url = url;
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

const requestStub = function request(url: string, options?: any): Task<ResponseStub> {
	if (responseMap.has(url)) {
		return Task.resolve(new ResponseStub(url, { response: responseMap.get(url) }));
	}
	return Task.resolve(new ResponseStub(url, { response: undefined, ok: false, status: 404, statusText: 'Not Found' }));
} as any as typeof request;

requestStub.get = requestStub;

export default requestStub;
