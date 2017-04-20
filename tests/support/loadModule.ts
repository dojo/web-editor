/**
 * Load a module via AMD require and resolve to it as a promise
 * @param mid The mid to load
 * @param req A local require for relative mids
 */
export default async function loadModule(mid: string, req: NodeRequire = require): Promise<any> {
	return new Promise((resolve, reject) => {
		try {
			req([ mid ], resolve);
		}
		catch (e) {
			reject(e);
		}
	});
}
