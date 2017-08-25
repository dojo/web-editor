export const proxyPort = 9000;
export const proxyUrl = 'http://localhost:9000/';

export const capabilities = {
	'browserstack.debug': false,
	project: 'Dojo 2',
	name: '@dojo/web-editor'
};

export const environments = [
	{ browserName: 'internet explorer', version: '11', platform: 'WINDOWS' },
	{ browserName: 'edge', platform: 'WINDOWS' },
	{ browserName: 'firefox', platform: 'WINDOWS' },
	{ browserName: 'chrome', platform: 'WINDOWS' },
	{ browserName: 'safari', version: '9.1', platform: 'MAC' },
	{ browserName: 'iPad', version: '9.1' }
];

export const maxConcurrency = 5;

export const tunnel = 'BrowserStackTunnel';

export const initialBaseUrl: string | null = (function () {
	if (typeof location !== 'undefined' && location.pathname.indexOf('__intern/') > -1) {
		return '/';
	}
	return null;
})();

export const loaders = {
	'host-browser': 'node_modules/@dojo/loader/loader.js',
	'host-node': '@dojo/loader'
};

export const loaderOptions = {
	packages: [
		{ name: '@dojo', location: 'node_modules/@dojo' },
		{ name: 'dojo', location: 'node_modules/intern/browser_modules/dojo' },
		{ name: 'cldr-data', location: 'node_modules/cldr-data' },
		{ name: 'cldrjs', location: 'node_modules/cldrjs' },
		{ name: 'globalize', location: 'node_modules/globalize', main: 'dist/globalize' },
		{ name: 'maquette', location: 'node_modules/maquette/dist', main: 'maquette.min' },
		{ name: 'pepjs', location: 'node_modules/pepjs/dist', main: 'pep' },
		{ name: 'src', location: 'dev/src' },
		{ name: 'sinon', location: 'node_modules/sinon/pkg', main: 'sinon' },
		{ name: 'source-map', location: 'node_modules/source-map/dist', main: 'source-map.debug' },
		{ name: 'tests', location: 'dev/tests' }
	],
	map: {
		globalize: {
			'cldr': 'cldrjs/dist/cldr',
			'cldr/event': 'cldrjs/dist/cldr/event',
			'cldr/supplemental': 'cldrjs/dist/cldr/supplemental',
			'cldr/unresolved': 'cldrjs/dist/cldr/unresolved'
		}
	}
};

export const suites = [ '@dojo/shim/Promise', '@dojo/test-extras/support/loadJsdom', 'tests/unit/all' ];

export const functionalSuites = [ 'tests/functional/all' ];

export const excludeInstrumentation = /(?:(?:node_modules|tests|examples|external|styles|themes|extensions)[\/\\]|worker-proxy\.js$|providers[\/\\]xhr\.js)/;
