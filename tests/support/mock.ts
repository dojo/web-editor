/// <reference path="../../node_modules/@dojo/loader/dojo-loader.d.ts" />
import { createHandle } from '@dojo/core/lang';
import { Handle } from '@dojo/interfaces/core';

const map: { [mid: string]: any } = {};
let disableHandle: Handle | undefined;

declare const define: DojoLoader.Define;

declare global {
	interface NodeRequire {
		undef(moduleId: string, recursive?: boolean): void;
	}
}

export function register(mid: string, mock: any): Handle {
	map[mid] = () => {
		define([], mock);
	};
	return createHandle(() => {
		if (disableHandle) {
			require.undef(mid);
		}
		delete map[mid];
	});
}

export function enable(): Handle {
	if (disableHandle) {
		return disableHandle;
	}
	require.cache(map);
	require.cache({});
	return disableHandle = createHandle(() => {
		const emptyMap: { [mid: string]: any } = {};
		for (const mid in map) {
			require.undef(mid, true);
			emptyMap[mid] = undefined;
		}
		require.cache(emptyMap);
		require.cache({});
		disableHandle = undefined;
	});
}

export function clear(): void {
	for (const mid in map) {
		map[mid] = undefined;
	}
	require.cache(map);
	require.cache({});
}
