interface NodeRequire {
	(deps: string[], callback: (...args: any[]) => void): void;
	config(config: any): void;
}

require.config({
	paths: {
		'vs': '../../../node_modules/monaco-editor/min/vs',
		'@dojo': '../../../node_modules/@dojo'
	},
	packages: [
		{ name: 'src', location: '../../..' }
	]
});

require([ './editor' ], function () {});
