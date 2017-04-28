import * as registerSuite from 'intern!object';
import * as assert from 'intern/chai!assert';
import { ProjectFileType } from '@dojo/cli-export-project/interfaces/project.json';
import { Handle } from '@dojo/interfaces/core';
import createMockIframe, { getDocumentStrings } from '../support/createMockIframe';
import loadModule from '../support/loadModule';
import DOMParser from '../../src/support/DOMParser';
import UnitUnderTest from '../../src/Runner';

import { EmitFile } from '../../src/interfaces';

// import { sandbox as sinonSandbox, SinonStub, SinonSandbox } from 'sinon';
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

// let sandbox: SinonSandbox;
// let consoleStub: SinonStub;

registerSuite({
	name: 'Runner',

	async setup() {
		// sandbox = sinonSandbox.create();
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
		// sandbox.restore();
	},

	beforeEach() {
		iframe = createMockIframe();
		iframe.setAttribute('src', './support/blank.html');
		runner = new Runner(iframe);
		// consoleStub = sandbox.stub(console, 'log');
	},

	afterEach() {
		runner.destroy();
		// sandbox.reset();
		// consoleStub.restore();
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
			assert.lengthOf(scripts, 2, 'should have had two blocks of script injected');
			const styles = doc.querySelectorAll('style');
			assert.lengthOf(styles, 0, 'should have no styles in header');
		},

		async 'adds modules to run iframe'() {
			projectEmit.push({
				name: 'src/foo.js',
				text: 'define([], function () { console.log("foo"); });',
				type: ProjectFileType.JavaScript
			});
			await runner.run();
			const doc = getDocFromString(getDocumentStrings(iframe)[0]);
			const scripts = doc.querySelectorAll('script');
			assert.include(scripts[1].text, `'src/foo': function`, 'should have exported module');
			assert.include(scripts[1].text, 'define([], function () { console.log("foo"); });', 'should include module text');
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
			assert.include(styles[0].textContent!, '/* from: src/main.css */', 'should have comment added');
			assert.include(styles[0].textContent!, 'body { font-size: 48px }', 'should have text added');
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
			assert.include(styles[0].textContent!, '/* from: project index */', 'should have comment added');
			assert.include(styles[0].textContent!, 'body { font-size: 12px; }', 'should have text added');
			assert.include(styles[0].textContent!, '.foo { font-size: 24px; }', 'should have text added');
			assert.include(styles[0].textContent!, '.bar { font-size: 72px; }', 'should have text added');
		}
	}
});
