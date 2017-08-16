import * as registerSuite from 'intern!object';
import * as assert from 'intern/chai!assert';
import { assign } from '@dojo/core/lang';
import harness, { Harness } from '@dojo/test-extras/harness';
import { HNode, WNode } from '@dojo/widget-core/interfaces';
import { stub, SinonStub } from 'sinon';
import createMockIframe, { callContentWindowListener, getDocumentStrings } from '../support/createMockIframe';
import { Program } from '../../src/project';
import Runner, { RunnerProperties } from '../../src/Runner';
import * as css from '../../src/styles/runner.m.css';
import DOMParser from '../../src/support/DOMParser';

let widget: Harness<RunnerProperties, typeof Runner>;
let iframe: HTMLIFrameElement;

const originalCreateElement = document.createElement.bind(document);
let stubCreateElement: SinonStub;

const testJS = `define(["require", "exports"], function (require, exports) {
    "use strict";
    exports.__esModule = true;
    function foo() { console.log('bar'); }
    exports.foo = foo;
    ;
});
`;

const testMap = `{"version":3,"file":"test.js","sourceRoot":"","sources":["test.ts"],"names":[],"mappings":";;;IAAA,iBAAwB,OAAO,CAAC,GAAG,CAAC,KAAK,CAAC,CAAC,CAAC,CAAC;IAA7C,kBAA6C;IAAA,CAAC","sourcesContent":["export function foo() { console.log('bar'); };\\n"]}`;

function getDocFromString(text: string): Document {
	const parser = new DOMParser();
	return parser.parseFromString(text, 'text/html');
}

function createProgram(overrides?: Partial<Program>): Program {
	return assign({
		css: [ ],
		dependencies: { },
		html: '<!DOCTYPE html><html><title></title><body></body></html>',
		modules: { }
	}, overrides);
}

function getRunnerDoc(program?: Partial<Program>): Promise<Document> {
	return new Promise<Document>((resolve, reject) => {
			function onRun() {
				try {
					const doc = getDocFromString(getDocumentStrings(iframe)[0]);
					resolve(doc);
				}
				catch (e) {
					reject(e);
				}
			}

			widget.setProperties({
				...createProgram(program),
				onRun
			});
			widget.getRender();
		}) as Promise<Document>;
}

registerSuite({
	name: 'Runner',

	setup() {
		stubCreateElement = stub(document, 'createElement').callsFake((elementName: string) => {
			if (elementName === 'iframe') {
				return iframe = createMockIframe();
			}
			return originalCreateElement(elementName);
		});
	},

	teardown() {
		stubCreateElement.restore();
	},

	beforeEach() {
		widget = harness(Runner);
	},

	'default render'() {
		/* decomposing this as the DomWrapper constructor function is not exposed and therefore can't put it in the
		 * expected render */
		const render = widget.getRender() as HNode;
		assert.strictEqual(render.tag, 'div', 'should be a "div" tag');
		assert.deepEqual(render.properties.classes, widget.classes(css.root)(), 'should have proper classes');
		assert.lengthOf(render.children, 1, 'should have only one child');
		assert.isFunction((render.children[0] as WNode).widgetConstructor, 'should be a function');
		assert.strictEqual((render.children[0] as WNode).properties.key, 'runner', 'should have runner key set');
		assert.strictEqual(((render.children[0] as WNode).properties as any).src, '../support/blank.html', 'should have src set to default');
	},

	'support setting src'() {
		widget.setProperties({
			src: 'foo.html'
		});
		const render = widget.getRender() as HNode;
		assert.strictEqual(((render.children[0] as WNode).properties as any).src, 'foo.html', 'should have src set to default');
	},

	async 'render empty program'() {
		const doc = await getRunnerDoc();
		const scripts = doc.querySelectorAll('script');
		assert.lengthOf(scripts, 3, 'should have had four blocks of script injected');
		const styles = doc.querySelectorAll('style');
		assert.lengthOf(styles, 0, 'should have no styles in header');
	},

	async 'adds modules to run iframe'() {
		const doc = await getRunnerDoc({
			modules: {
				'src/foo': {
					code: testJS,
					map: ''
				}
			}
		});
		const scripts = doc.querySelectorAll('script');
		assert.include(scripts[2].text, `cache['src/foo'] = function`, 'should have exported module');
		assert.include(scripts[2].text, testJS, 'should include module text');
		assert.include(scripts[2].text, '//# sourceURL=src/foo.js', 'should include a source URL');
	},

	async 'adds modules with source maps to run in iframe'() {
		const doc = await getRunnerDoc({
			modules: {
				'src/foo': {
					code: testJS,
					map: testMap
				}
			}
		});
		const scripts = doc.querySelectorAll('script');
		assert.include(scripts[2].text, testJS, 'should include module text');
		assert.include(scripts[2].text, '//# sourceMappingURL=data:application/json;base64,', 'should include an inline sourcemap');
	},

	async 'adds CSS to iframe'() {
		const doc = await getRunnerDoc({
			css: [ { name: 'src/main.css', text: 'body { font-size: 48px }' } ]
		});
		const styles = doc.querySelectorAll('style');
		assert.include(styles[0].textContent!, 'body { font-size: 48px }', 'should have text added');
	},

	async 'handles css url() encoding'() {
		const doc = await getRunnerDoc({
			css: [ { name: 'src/main.css', text: `body { background-image: url('data:image/svg+xml;utf8,<svg version="1.1"	 xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:a="http://ns.adobe.com/AdobeSVGViewerExtensions/3.0/"	 x="0px" y="0px" width="24px" height="24px" viewBox="0 0 24 24" style="enable-background:new 0 0 24 24;" xml:space="preserve"></svg>'); }` } ]
		});
		const styles = doc.querySelectorAll('style');
		assert.include(styles[0].textContent!, `data:image/svg+xml;utf8,%3Csvg%20version=%221.1%22%09%20xmlns=%22http://www.w3.org/2000/svg%22%20xmlns:xlink=%22http://www.w3.org/1999/xlink%22%20xmlns:a=%22http://ns.adobe.com/AdobeSVGViewerExtensions/3.0/%22%09%20x=%220px%22%20y=%220px%22%20width=%2224px%22%20height=%2224px%22%20viewBox=%220%200%2024%2024%22%20style=%22enable-background:new%200%200%2024%2024;%22%20xml:space=%22preserve%22%3E%3C/svg%3E`, 'should encoded URI');
	},

	async 'adds styles from index.html'() {
		const html = `<!DOCTYPE html><html><head>
			<style>body { font-size: 12px; }</style>
			<style>.foo { font-size: 24px; }</style>
		</head><body>
			<style>.bar { font-size: 72px; }</style>
		</body></html>`;
		const doc = await getRunnerDoc({ html });
		const styles = doc.querySelectorAll('style');
		assert.include(styles[0].textContent!, 'body { font-size: 12px; }', 'should have text added');
		assert.include(styles[0].textContent!, '.foo { font-size: 24px; }', 'should have text added');
		assert.include(styles[0].textContent!, '.bar { font-size: 72px; }', 'should have text added');
	},

	async 'add body attributes from index.html'() {
		const html = `<!DOCTYPE html><html><head></head><body class="foo"></body></html>`;
		const doc = await getRunnerDoc({ html });
		assert.strictEqual(doc.body.className, 'foo', 'should have copied over class attributes');
	},

	async 'ignores styles that are empty or scoped'() {
		const html = `<!DOCTYPE html><html><head></head><body>
			<style></style>
			<div>
				<style scoped>div { font-size: 28px; }</style>
			</div>
		</body></html>`;
		const doc = await getRunnerDoc({ html });
		const styles = doc.querySelectorAll('style');
		assert.isFalse(!!styles[0].textContent, 'style content should be empty');
	},

	async 'copies over external src scripts'() {
		const html = `<!DOCTYPE html><html><head></head><body>
			<script src="http://foo.bar/index.js"></script>
			<script src="https://foo.bar/baz.js"></script>
			<script src="file://some/file.js"></script>
			<script>
				console.log('PWN ME!');
			</script>
			<script src="./foo/bar.js"></script>
			<script src="${window.location.protocol}//${window.location.hostname}/bar.js"></script>
		</body></html>`;
		const doc = await getRunnerDoc({ html });
		const scripts = doc.querySelectorAll('script');
		assert.lengthOf(scripts, 5, 'should have five script nodes');
		assert.isNotTrue(scripts[0].text, 'script node should not have text');
		assert.isNotTrue(scripts[1].text, 'script node should not have text');
		assert.strictEqual(scripts[0].src, 'http://foo.bar/index.js', 'should have proper src attribute');
		assert.strictEqual(scripts[1].src, 'https://foo.bar/baz.js', 'should have proper src attribute');
	},

	async 'handles project dependencies'() {
		const doc = await getRunnerDoc({
			dependencies: {
				'@dojo/foo': '~2.0.0',
				'@dojo/bar': 'beta1'
			}
		});
		const scripts = doc.querySelectorAll('script');
		const main = scripts[1];
		assert(main, 'should have a main script');
		assert.include(main.text, `'@dojo/foo': 'https://unpkg.com/@dojo/foo@~2.0.0'`);
		assert.include(main.text, `'@dojo/bar': 'https://unpkg.com/@dojo/bar@beta1'`);
	},

	async 'handles special dependencies'() {
		const doc = await getRunnerDoc({
			dependencies: {
				'cldrjs': '1.0.0',
				'globalize': '1.0.0',
				'maquette': '1.0.0',
				'pepjs': '1.0.0'
			}
		});
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

		function onError() {
			called = true;
		}

		return new Promise((resolve, reject) => {
				function onRun() {
					try {
						callContentWindowListener(iframe, 'error');
						assert.isTrue(called, 'event listener chould have been called');
						resolve();
					}
					catch (e) {
						reject(e);
					}
				}

				widget.setProperties(assign(createProgram(), { onRun, onError }));
				widget.getRender();
			});
	}
});
