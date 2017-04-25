export * from './intern';

export const environments = [
	{ browserName: 'internet explorer', version: '11.0', platform: 'Windows 7' },
	{ browserName: 'MicrosoftEdge', platform: 'Windows 10' },
	{ browserName: 'firefox', platform: 'Windows 10' },
	{ browserName: 'chrome', platform: 'Windows 10' },
	{ browserName: 'safari', platform: 'OS X 10.12' },
	{ browserName: 'ipad', version: '9.3' }
];

export const maxConcurrency = 4;

export const tunnel = 'SauceLabsTunnel';
