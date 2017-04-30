import { PausableHandle } from '@dojo/core/on';
import { Request } from '@dojo/routing/interfaces';
import Route from '@dojo/routing/Route';
import Router from '@dojo/routing/Router';
import { Parameters } from '@dojo/routing/interfaces';
import HashHistory from '@dojo/routing/history/HashHistory';

export interface GistParameters extends Parameters {
	/**
	 * The ID of the gist
	 */
	id: string;
}

export interface GistRouterOptions {
	/**
	 * Called by the router when the route matches `/{id}`
	 */
	onGist: (request: Request<any, GistParameters>) => void;

	/**
	 * Called by the router when the route matches `/`
	 */
	onRoot: (request: Request<any, any>) => void;
}

const router = new Router<GistParameters>({ history: new HashHistory() });

export const { setPath } = router;

/**
 * Configure and start a router which handles routes as references to gists
 * @param options Listeners for specific routes
 */
export function startGistRouter(options: GistRouterOptions): PausableHandle {
	router.append(new Route({
		path: '/',
		exec: options.onRoot
	}));

	router.append(new Route<any, GistParameters>({
		path: '/{id}',
		exec: options.onGist
	}));

	return router.start();
}
