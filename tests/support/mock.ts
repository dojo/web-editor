/// <reference path="../../node_modules/@dojo/loader/dojo-loader.d.ts" />
import { createHandle } from '@dojo/core/lang';
import { Handle } from '@dojo/interfaces/core';

const map: { [mid: string]: any } = {};
let disableHandle: Handle;

declare const define: DojoLoader.Define;

export function register(mid: string, mock: any): Handle {
	map[mid] = () => {
		define([], mock);
	};
	return createHandle(() => {
		map[mid] = undefined;
	});
}

export function enable(): Handle {
	if (disableHandle) {
		return disableHandle;
	}
	require.cache(map);
	require.cache({});
	return createHandle(() => {
		const emptyMap: { [mid: string]: any } = {};
		for (const mid in map) {
			emptyMap[mid] = undefined;
		}
		require.cache(emptyMap);
		require.cache({});
	});
}

export function clear(): void {
	for (const mid in map) {
		map[mid] = undefined;
	}
	require.cache(map);
	require.cache({});
}
