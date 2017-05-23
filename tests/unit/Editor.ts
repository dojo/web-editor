import * as registerSuite from 'intern!object';
import * as assert from 'intern/chai!assert';
import global from '@dojo/core/global';
import { assign } from '@dojo/core/lang';
import { Handle } from '@dojo/interfaces/core';
import harness, { Harness } from '@dojo/test-extras/harness';
import { v } from '@dojo/widget-core/d';
import loadModule from '../support/loadModule';
import * as css from '../../src/styles/editor.m.css';
import UnitUnderTest, { EditorProperties } from '../../src/Editor';

import { sandbox as sinonSandbox, SinonSandbox, SinonSpy, SinonStub } from 'sinon';
import { enable, register } from '../support/mock';

/* tslint:disable:variable-name */
let Editor: typeof UnitUnderTest;
let widget: Harness<EditorProperties, typeof UnitUnderTest>;

let sandbox: SinonSandbox;
let mockHandle: Handle;
let monacoEditorCreateElement: HTMLElement;
let monacoEditorCreateOptions: any;
let setModelStub: SinonStub;
let onDidChangeModelContentStub: SinonStub;
let onDidChangeModelContentDisposeStub: SinonStub;
let disposeStub: SinonStub;
let layoutStub: SinonStub;
let setFileDirtyStub: SinonStub;

let projectFileMap: { [filename: string]: boolean; };

function getMonacoEditor(properties: Partial<EditorProperties> = {}): Promise<monaco.editor.IStandaloneCodeEditor> {
	return new Promise((resolve, reject) => {
		function onEditorInit(editor: monaco.editor.IStandaloneCodeEditor) {
			try {
				resolve(editor);
			}
			catch (e) {
				reject(e);
			}
		}

		widget.setProperties(assign(properties, { onEditorInit }));
		widget.getRender();
	});
}

registerSuite({
	name: 'Editor',

	async setup() {
		sandbox = sinonSandbox.create();
		setModelStub = sandbox.stub();
		onDidChangeModelContentDisposeStub = sandbox.stub();
		onDidChangeModelContentStub = sandbox.stub();
		disposeStub = sandbox.stub();
		layoutStub = sandbox.stub();
		setFileDirtyStub = sandbox.stub();

		register('src/project', {
			default: {
				includes: sandbox.spy((filename: string) => {
					return projectFileMap[filename];
				}),
				getFileModel: sandbox.spy((filename: string) => {
					return `model('${filename}')`;
				}),
				setFileDirty: setFileDirtyStub
			}
		});

		global.monaco = {
			editor: {
				create: sandbox.spy((element: HTMLElement, options?: any) => {
					monacoEditorCreateElement = element;
					monacoEditorCreateOptions = options;
					return {
						dispose: disposeStub,
						layout: layoutStub,
						onDidChangeModelContent: onDidChangeModelContentStub,
						setModel: setModelStub
					};
				})
			}
		};

		mockHandle = enable();

		Editor = (await loadModule('../../src/Editor', require)).default;
	},

	beforeEach() {
		widget = harness(Editor);
		onDidChangeModelContentStub.returns({
			dispose: onDidChangeModelContentDisposeStub
		});
		projectFileMap = {};
	},

	afterEach() {
		sandbox.reset();
	},

	teardown() {
		delete global.monaco;
		sandbox.restore();
		mockHandle.destroy();
	},

	'expected render'() {
		widget.expectRender(v('div', {
			afterCreate: widget.listener,
			afterUpdate: widget.listener,
			classes: widget.classes(css.base)
		}));
	},

	async 'editor is initalized'() {
		const editor = await getMonacoEditor();
		const createSpy = monaco.editor.create as SinonSpy;
		assert(editor, 'editor should be exist');
		assert.isTrue(createSpy.called, 'create should have been called');
		assert.strictEqual(monacoEditorCreateElement, widget.getDom(), 'should have passed its root element to create');
	},

	async 'editor passes options'() {
		await getMonacoEditor({
			options: {
				theme: 'vs-code-pretty'
			}
		});
		assert.deepEqual(monacoEditorCreateOptions, { theme: 'vs-code-pretty' }, 'should pass options properly');
	},

	async 'sets the proper file'() {
		projectFileMap['./src/main.ts'] = true;
		await getMonacoEditor();
		widget.setProperties({
			filename: './src/main.ts'
		});
		assert.isFalse(setModelStub.called, 'should not have been called yet');
		widget.getRender();
		assert.isTrue(setModelStub.called, 'should have set the model on the editor');
		assert.strictEqual(setModelStub.lastCall.args[0], `model('./src/main.ts')`, 'should have set the proper model');
	},

	async 'setting to missing file is a no-op'() {
		await getMonacoEditor();
		widget.setProperties({
			filename: './src/main.ts'
		});
		assert.isFalse(setModelStub.called, 'should not have been called yet');
		widget.getRender();
		assert.isFalse(setModelStub.called, 'should not have been called');
	},

	async 'does layout on re-renders'() {
		let called = false;
		function onEditorLayout() {
			called = true;
		}
		await getMonacoEditor({
			onEditorLayout
		});
		assert.isFalse(called, 'should not have been called yet');
		widget.setProperties({
			filename: './src/foo.ts',
			onEditorLayout
		});
		widget.getRender();
		return new Promise((resolve, reject) => {
			setTimeout(() => {
				try {
					assert.isTrue(called, 'should have called layout');
					resolve();
				}
				catch (e) {
					reject(e);
				}
			}, 500);
		});
	},

	async '_onDidChangeModelContent'(this: any) {
		projectFileMap['./src/foo.ts'] = true;
		await getMonacoEditor();
		widget.setProperties({
			filename: './src/foo.ts'
		});
		widget.getRender();
		const _onDidChangeModelContent: () => void = onDidChangeModelContentStub.lastCall.args[0];
		assert.strictEqual(setFileDirtyStub.callCount, 0, 'should not have been called');
		[ 10, 20, 30, 40, 50, 100 ].forEach((interval) => {
			setTimeout(() => {
				_onDidChangeModelContent();
			}, interval);
		});
		return new Promise((resolve, reject) => {
			setTimeout(() => {
				try {
					assert.strictEqual(setFileDirtyStub.callCount, 1, 'should have been called once, being debounced');
					assert.strictEqual(setFileDirtyStub.lastCall.args[0], './src/foo.ts', 'should have called with proper filename');
					resolve();
				}
				catch (e) {
					reject(e);
				}
			}, 1500);
		});
	}
});
