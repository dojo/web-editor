import { Request } from '@dojo/routing/interfaces';
import Router from '@dojo/routing/Router';
import Map from '@dojo/shim/Map';

export let currentPath = '';

export let currentRouter: RouterStub;

class RouterStub {
	private _routeMap = new Map<string, (request: Request<any, any>) => void>();
	private _started = false;

	constructor (options?: any) {
		if (!options.history) {
			throw new TypeError('Missing History Option');
		}
		currentRouter = this;
	}

	__reset__() {
		this._started = false;
		this._routeMap.clear();
	}

	append(add: any): void {
		this._routeMap.set(add.path, add.exec);
	}

	setPath(path: string): void {
		currentPath = path;
		if (this._started) {
			if (!currentPath) {
				if (this._routeMap.has('/')) {
					this._routeMap.get('/')!.call(undefined, { context: {}, params: {} });
				}
			}
			else {
				if (this._routeMap.has('/{id}')) {
					this._routeMap.get('/{id}')!.call(undefined, { context: {}, params: { id: path } });
				}
			}
		}
	}

	start() {
		const self = this;
		self._started = true;
		return {
			destroy() {
				self._started = false;
			},
			pause() {
				self._started = false;
			},
			resume() {
				self._started = true;
			}
		};
	}
}

export default RouterStub as any as typeof Router;
