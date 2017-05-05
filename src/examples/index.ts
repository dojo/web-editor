interface NodeRequire {
	(deps: string[], callback: (...args: any[]) => void): void;
	config(config: any): void;
}

require.config({
	paths: {
		'vs': '../../../node_modules/monaco-editor/min/vs',
		'@dojo': '../../../node_modules/@dojo',
		'source-map': '../../../node_modules/source-map/dist/source-map.min'
	},
	packages: [
		{ name: 'src', location: '../../..' }
	]
});

require([ './editor' ], function () {});
