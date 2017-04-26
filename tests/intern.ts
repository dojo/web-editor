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
	{ browserName: 'safari', version: '10', platform: 'MAC' },
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
		{ name: 'src', location: 'dev/src' },
		{ name: 'sinon', location: 'node_modules/sinon/pkg', main: 'sinon' },
		{ name: 'tests', location: 'dev/tests' }
	]
};

export const suites = [ '@dojo/shim/Promise', '@dojo/test-extras/support/loadJsdom', 'tests/unit/all' ];

export const functionalSuites = [ 'tests/functional/all' ];

export const excludeInstrumentation = /(?:node_modules|tests|examples|external)[\/\\]/;
