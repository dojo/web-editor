import * as registerSuite from 'intern!object';
import * as assert from 'intern/chai!assert';
import { Handle } from '@dojo/interfaces/core';
import loadModule from '../../support/loadModule';
import * as UnitUnderTest from '../../../src/support/css';

import { ProjectFileType } from '@dojo/cli-export-project/interfaces/project.json';

import { sandbox as sinonSandbox, SinonSandbox, SinonSpy, SinonStub } from 'sinon';
import { enable, register } from '../../support/mock';

let getEmit: typeof UnitUnderTest.getEmit;
let getDefinitions: typeof UnitUnderTest.getDefinitions;

let sandbox: SinonSandbox;
let mockHandle: Handle;
let cssnextStub: SinonStub;

let postcssSpy: SinonSpy;
let postcssProcessSpy: SinonSpy;
let postcssModulesSpy: SinonSpy;
let getJSON: (filename: string, json: { [className: string]: string }) => void;

const getJSONMocks: any[] = [ undefined, { foo: '._foo_abc' }, undefined ];

registerSuite({
	name: 'support/css',

	async setup() {
		sandbox = sinonSandbox.create();
		cssnextStub = sandbox.stub();

		postcssModulesSpy = sandbox.spy((config: any) => {
			getJSON = config.getJSON;
		});

		postcssProcessSpy = sandbox.spy(() => {
			getJSON && getJSON('', getJSONMocks[postcssProcessSpy.callCount]);
			return Promise.resolve({
				css: 'mock'
			});
		});
		postcssSpy = sandbox.spy((config: any[]) => {
			return {
				process: postcssProcessSpy
			};
		});

		register('postcss', postcssSpy);
		register('postcss-cssnext', cssnextStub);
		register('postcss-modules', postcssModulesSpy);

		mockHandle = enable();

		const css: typeof UnitUnderTest = await loadModule('../../src/support/css');
		getEmit = css.getEmit;
		getDefinitions = css.getDefinitions;
	},

	teardown() {
		sandbox.restore();
		mockHandle.destroy();
	},

	afterEach() {
		sandbox.reset();
	},

	'getEmit()': {
		async 'processes a css file'() {
			const file = {
				name: './styles/foo.css',
				text: '.foo { font-size: 48px; }',
				type: ProjectFileType.CSS
			};
			const emit = await getEmit(file);
			assert.lengthOf(emit, 2, 'should have emitted two files');
			assert.deepEqual(emit[0], {
				name: './styles/foo.css',
				text: 'mock',
				type: ProjectFileType.CSS
			});
			assert.deepEqual(emit[1], {
				name: './styles/foo.css.js',
				text: 'define([], function () {\n\t\treturn {\n\t\t\t\'foo\': \'._foo_abc\',\n\t\' _key\': \'foo\'\n\t\t};\n\t});\n',
				type: ProjectFileType.JavaScript
			});
			assert.strictEqual(cssnextStub.callCount, 1, 'should have been called once');
		},

		async 'process multiple files one with no classes'() {
			const filea = {
				name: './styles/foo.css',
				text: '.foo { font-size: 48px; }',
				type: ProjectFileType.CSS
			};
			const fileb = {
				name: './styles/bar.css',
				text: '',
				type: ProjectFileType.CSS
			};
			const emit = await getEmit(filea, fileb);
			assert.lengthOf(emit, 3, 'should have emitted three files');
			assert.deepEqual(emit[0], {
				name: './styles/foo.css',
				text: 'mock',
				type: ProjectFileType.CSS
			});
			assert.deepEqual(emit[1], {
				name: './styles/foo.css.js',
				text: 'define([], function () {\n\t\treturn {\n\t\t\t\'foo\': \'._foo_abc\',\n\t\' _key\': \'foo\'\n\t\t};\n\t});\n',
				type: ProjectFileType.JavaScript
			});
			assert.deepEqual(emit[2], {
				name: './styles/bar.css',
				text: 'mock',
				type: ProjectFileType.CSS
			});
			assert.strictEqual(cssnextStub.callCount, 1, 'should have been called once');
		}
	},

	'getDefinitions()': {
		async 'processes a css file'() {
			const file = {
				name: './styles/foo.css',
				text: '.foo { font-size: 48px; }',
				type: ProjectFileType.CSS
			};
			const definitions = await getDefinitions(file);
			assert.lengthOf(definitions, 1, 'should have emitted one file');
			assert.deepEqual(definitions[0], {
				name: './styles/foo.css.d.ts',
				text: 'export const foo: string;\n',
				type: ProjectFileType.Definition
			});
			assert.strictEqual(cssnextStub.callCount, 0, 'should not have been called once');
		},

		async 'process multiple files one with no classes'() {
			const filea = {
				name: './styles/foo.css',
				text: '.foo { font-size: 48px; }',
				type: ProjectFileType.CSS
			};
			const fileb = {
				name: './styles/bar.css',
				text: '',
				type: ProjectFileType.CSS
			};
			const definitions = await getDefinitions(filea, fileb);
			assert.lengthOf(definitions, 1, 'should have emitted one file');
			assert.deepEqual(definitions[0], {
				name: './styles/foo.css.d.ts',
				text: 'export const foo: string;\n',
				type: ProjectFileType.Definition
			});
			assert.strictEqual(cssnextStub.callCount, 0, 'should not have been called once');
		}
	}
});
