import * as registerSuite from 'intern!object';
import * as assert from 'intern/chai!assert';
import { ProjectFileType } from '@dojo/cli-export-project/interfaces/project.json';
import { Handle } from '@dojo/interfaces/core';
import createMockIframe, { callContentWindowListener, getDocumentStrings } from '../support/createMockIframe';
import loadModule from '../support/loadModule';
import DOMParser from '../../src/support/DOMParser';
import UnitUnderTest from '../../src/Runner';

import { EmitFile } from '../../src/interfaces';

import { enable, register } from '../support/mock';

function getDocFromString(text: string): Document {
	const parser = new DOMParser();
	return parser.parseFromString(text, 'text/html');
}

/* tslint:disable:variable-name */
let Runner: typeof UnitUnderTest;

let mockHandle: Handle;
let projectLoaded = true;
let projectEmit: EmitFile[] = [];
let projectDependencies: { [pkg: string]: string } = {};
let projectIndexHtml = '';
let iframe: HTMLIFrameElement;
let runner: UnitUnderTest;

const testJS = `define(["require", "exports"], function (require, exports) {
    "use strict";
    exports.__esModule = true;
    function foo() { console.log('bar'); }
    exports.foo = foo;
    ;
});
`;

const testMap = `{"version":3,"file":"test.js","sourceRoot":"","sources":["test.ts"],"names":[],"mappings":";;;IAAA,iBAAwB,OAAO,CAAC,GAAG,CAAC,KAAK,CAAC,CAAC,CAAC,CAAC;IAA7C,kBAA6C;IAAA,CAAC","sourcesContent":["export function foo() { console.log('bar'); };\\n"]}`;

registerSuite({
	name: 'Runner',

	async setup() {
		register('src/project', {
			default: {
				isLoaded() {
					return projectLoaded;
				},

				emit() {
					return projectEmit;
				},

				getDependencies() {
					return projectDependencies;
				},

				getIndexHtml() {
					return projectIndexHtml;
				}
			}
		});

		mockHandle = enable();

		Runner = (await loadModule('../../src/Runner')).default;
	},

	teardown() {
		mockHandle.destroy();
	},

	beforeEach() {
		iframe = createMockIframe();
		iframe.setAttribute('src', './support/blank.html');
		runner = new Runner(iframe);
	},

	afterEach() {
		runner.destroy();
		projectLoaded = true;
		projectEmit = [];
		projectDependencies = {};
		projectIndexHtml = '';
	},

	'construct'() {
		assert.instanceOf(runner, Runner, 'should be instance of runner');
	},

	'run()': {
		async 'defaults'() {
			await runner.run();
			const strings = getDocumentStrings(iframe);
			assert.lengthOf(strings, 1, 'should have the proper number of strings');
			const doc = getDocFromString(strings[0]);
			const scripts = doc.querySelectorAll('script');
			assert.lengthOf(scripts, 3, 'should have had three blocks of script injected');
			const styles = doc.querySelectorAll('style');
			assert.lengthOf(styles, 0, 'should have no styles in header');
		},

		async 'handles removal of content window from frame'() {
			delete (<any> iframe).contentWindow;
			runner.destroy();
		},

		async 'adds modules to run iframe'() {
			projectEmit.push({
				name: 'src/foo.js',
				text: testJS,
				type: ProjectFileType.JavaScript
			});
			await runner.run();
			const doc = getDocFromString(getDocumentStrings(iframe)[0]);
			const scripts = doc.querySelectorAll('script');
			assert.include(scripts[2].text, `cache['src/foo'] = function`, 'should have exported module');
			assert.include(scripts[2].text, testJS, 'should include module text');
			assert.include(scripts[2].text, '//# sourceURL=src/foo.js', 'should include a source URL');
		},

		async 'adds modules with source maps to run in iframe'() {
			projectEmit.push({
				name: 'src/foo.js',
				text: testJS,
				type: ProjectFileType.JavaScript
			});
			projectEmit.push({
				name: 'src/foo.js.map',
				text: testMap,
				type: ProjectFileType.SourceMap
			});
			await runner.run();
			const doc = getDocFromString(getDocumentStrings(iframe)[0]);
			const scripts = doc.querySelectorAll('script');
			assert.include(scripts[2].text, testJS, 'should include module text');
			assert.include(scripts[2].text, '//# sourceMappingURL=data:application/json;base64,', 'should include an inline sourcemap');
		},

		async 'adds css to run iframe'() {
			projectEmit.push({
				name: 'src/main.css',
				text: 'body { font-size: 48px }',
				type: ProjectFileType.CSS
			});
			await runner.run();
			const doc = getDocFromString(getDocumentStrings(iframe)[0]);
			const styles = doc.querySelectorAll('style');
			assert.include(styles[0].textContent!, 'body { font-size: 48px }', 'should have text added');
		},

		async 'handles css url() encoding'() {
			projectEmit.push({
				name: 'src/main.css',
				text: `body { background-image: url('data:image/svg+xml;utf8,<svg version="1.1"	 xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:a="http://ns.adobe.com/AdobeSVGViewerExtensions/3.0/"	 x="0px" y="0px" width="24px" height="24px" viewBox="0 0 24 24" style="enable-background:new 0 0 24 24;" xml:space="preserve"></svg>'); }`,
				type: ProjectFileType.CSS
			});
			await runner.run();
			const doc = getDocFromString(getDocumentStrings(iframe)[0]);
			const styles = doc.querySelectorAll('style');
			assert.include(styles[0].textContent!, `data:image/svg+xml;utf8,%3Csvg%20version=%221.1%22%09%20xmlns=%22http://www.w3.org/2000/svg%22%20xmlns:xlink=%22http://www.w3.org/1999/xlink%22%20xmlns:a=%22http://ns.adobe.com/AdobeSVGViewerExtensions/3.0/%22%09%20x=%220px%22%20y=%220px%22%20width=%2224px%22%20height=%2224px%22%20viewBox=%220%200%2024%2024%22%20style=%22enable-background:new%200%200%2024%2024;%22%20xml:space=%22preserve%22%3E%3C/svg%3E`, 'should encoded URI');
		},

		async 'adds styles from index.html'() {
			projectIndexHtml = `<!DOCTYPE html><html><head>
				<style>body { font-size: 12px; }</style>
				<style>.foo { font-size: 24px; }</style>
			</head><body>
				<style>.bar { font-size: 72px; }</style>
			</body></html>`;
			await runner.run();
			const doc = getDocFromString(getDocumentStrings(iframe)[0]);
			const styles = doc.querySelectorAll('style');
			assert.include(styles[0].textContent!, 'body { font-size: 12px; }', 'should have text added');
			assert.include(styles[0].textContent!, '.foo { font-size: 24px; }', 'should have text added');
			assert.include(styles[0].textContent!, '.bar { font-size: 72px; }', 'should have text added');
		},

		async 'ignores styles that are empty or scoped'() {
			projectIndexHtml = `<!DOCTYPE html><html><head></head><body>
				<style></style>
				<div>
					<style scoped>div { font-size: 28px; }</style>
				</div>
			</body></html>`;
			await runner.run();
			const doc = getDocFromString(getDocumentStrings(iframe)[0]);
			const styles = doc.querySelectorAll('style');
			assert.isFalse(!!styles[0].textContent, 'style content should be empty');
		},

		async 'copies over external src scripts'() {
			projectIndexHtml = `<!DOCTYPE html><html><head></head><body>
				<script src="http://foo.bar/index.js"></script>
				<script src="https://foo.bar/baz.js"></script>
				<script src="file://some/file.js"></script>
				<script>
					console.log('PWN ME!');
				</script>
				<script src="./foo/bar.js"></script>
				<script src="${window.location.protocol}//${window.location.hostname}/bar.js"></script>
			</body></html>`;
			await runner.run();
			const doc = getDocFromString(getDocumentStrings(iframe)[0]);
			const scripts = doc.querySelectorAll('script');
			assert.lengthOf(scripts, 5, 'should have five script nodes');
			assert.isNotTrue(scripts[0].text, 'script node should not have text');
			assert.isNotTrue(scripts[1].text, 'script node should not have text');
			assert.strictEqual(scripts[0].src, 'http://foo.bar/index.js', 'should have proper src attribute');
			assert.strictEqual(scripts[1].src, 'https://foo.bar/baz.js', 'should have proper src attribute');
		},

		async 'handles project dependencies'() {
			projectDependencies['@dojo/foo'] = '~2.0.0';
			projectDependencies['@dojo/bar'] = 'beta1';
			await runner.run();
			const doc = getDocFromString(getDocumentStrings(iframe)[0]);
			const scripts = doc.querySelectorAll('script');
			const main = scripts[1];
			assert(main, 'should have a main script');
			assert.include(main.text, `'@dojo/foo': 'https://unpkg.com/@dojo/foo@~2.0.0'`);
			assert.include(main.text, `'@dojo/bar': 'https://unpkg.com/@dojo/bar@beta1'`);
		},

		async 'handles special dependencies'() {
			projectDependencies['cldrjs'] = '1.0.0';
			projectDependencies['globalize'] = '1.0.0';
			projectDependencies['maquette'] = '1.0.0';
			projectDependencies['pepjs'] = '1.0.0';
			await runner.run();
			const doc = getDocFromString(getDocumentStrings(iframe)[0]);
			const scripts = doc.querySelectorAll('script');
			const main = scripts[1];
			assert(main, 'should have a main script');
			assert.include(main.text, `{ name: 'cldr', location: 'https://unpkg.com/cldrjs@1.0.0/dist/cldr', main: '../cldr' }`);
			assert.include(main.text, `{ name: 'globalize', main: '/dist/globalize' }`);
			assert.include(main.text, `{ name: 'maquette', main: '/dist/maquette.min' }`);
			assert.include(main.text, `{ name: 'pepjs', main: 'dist/pep' }`);
		},

		async 'iframe contentWindow errors are emitted from runner'() {
			let called = false;
			runner.on('error', (evt) => {
				assert.strictEqual(evt.type, 'error');
				called = true;
			});
			await runner.run();
			callContentWindowListener(iframe, 'error');
			assert.isTrue(called, 'event listener chould have been called');
		},

		'throws on unloaded project'(this: any) {
			const dfd = this.async();
			projectLoaded = false;
			runner.run().then(dfd.reject, dfd.callback((err: Error) => {
				assert.instanceOf(err, Error);
				assert.strictEqual(err.message, 'Project not loaded.');
			}));
		},

		'getDoc()': {
			'default properties'() {
				const text = runner.getDoc({
					dependencies: {},
					loaderSrc: 'foo.bar.js',
					modules: {}
				});
				const doc = getDocFromString(text);
				const scripts = doc.querySelectorAll('script');
				assert.lengthOf(scripts, 3, 'should have three script blocks');
				assert.strictEqual(scripts[0].getAttribute('src'), 'foo.bar.js\n', 'should set proper loader source');
			},

			'handles body attributes'() {
				const text = runner.getDoc({
					bodyAttributes: {
						'class': 'foo',
						'style': 'font-size: 48px;'
					},
					dependencies: {},
					loaderSrc: 'foo.bar.js',
					modules: {}
				});
				const doc = getDocFromString(text);
				const body = doc.body;
				assert.strictEqual(body.className, 'foo', 'should have classes set');
				assert.strictEqual(body.getAttribute('style'), 'font-size: 48px;', 'should have proper style');
			}
		}
	}
});
