/// <reference path="../../node_modules/@dojo/loader/dojo-loader.d.ts" />
import { createHandle } from '@dojo/core/lang';
import { Handle } from '@dojo/interfaces/core';

const map: { [mid: string]: any } = {};
let disableHandle: Handle | undefined;

declare const define: DojoLoader.Define;

/* TODO remove when https://github.com/dojo/loader/issues/126 is resolved */
declare global {
	interface NodeRequire {
		undef(moduleId: string, recursive?: boolean): void;
	}
}

/**
 * Register a module to be mocked when mocking is enabled
 * @param mid The absolute module ID to mock
 * @param mock The mock definition of the module
 */
export function register(mid: string, mock: any): Handle {
	if (disableHandle) {
		throw new Error('Cannot register modules while mock is enabled.');
	}
	map[mid] = () => define(mid, [], () => mock);
	return createHandle(() => {
		if (disableHandle) {
			require.undef(mid);
		}
		delete map[mid];
	});
}

/**
 * Enable mocking of modules with the `@dojo/loader`.
 *
 * The function will return a `Handle` which will disable the mocks and remove them from
 * the loader.
 */
export function enable(): Handle {
	if (disableHandle) {
		return disableHandle;
	}
	for (const mid in map) {
		require.undef(mid);
	}
	require.cache(map);
	require.cache({});
	return disableHandle = createHandle(() => {
		if (!disableHandle) {
			return;
		}
		const emptyMap: { [mid: string]: undefined } = {};
		for (const mid in map) {
			require.undef(mid);
			emptyMap[mid] = undefined;
			delete map[mid];
		}
		require.cache(emptyMap);
		require.cache({});
		disableHandle = undefined;
	});
}
