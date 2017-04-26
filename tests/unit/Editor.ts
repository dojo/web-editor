import * as registerSuite from 'intern!object';
import * as assert from 'intern/chai!assert';
import global from '@dojo/core/global';
import { Handle } from '@dojo/interfaces/core';
import loadModule from '../support/loadModule';
import UnitUnderTest from '../../src/Editor';

import { sandbox as sinonSandbox, SinonStub, SinonSandbox } from 'sinon';
import { enable, register } from '../support/mock';

/* tslint:disable:variable-name */
let Editor: typeof UnitUnderTest;

let sandbox: SinonSandbox;
let mockHandle: Handle;
let projectStub: SinonStub;
let monacoEditorCreateElement: HTMLElement;
let monacoEditorCreateOptions: any;
let setModelStub: SinonStub;
let onDidChangeModelContentStub: SinonStub;
let onDidChangeModelContentDisposeStub: SinonStub;
let disposeStub: SinonStub;
let setFileDirtyStub: SinonStub;

let projectFileMap: { [filename: string]: boolean; };

registerSuite({
	name: 'Editor',

	async setup() {
		sandbox = sinonSandbox.create();
		setModelStub = sandbox.stub();
		onDidChangeModelContentDisposeStub = sandbox.stub();
		onDidChangeModelContentStub = sandbox.stub();
		projectStub = sandbox.stub();
		disposeStub = sandbox.stub();
		setFileDirtyStub = sandbox.stub();

		register('src/project', () => {
			return {
				default: {
					includes: sandbox.spy((filename: string) => {
						return projectFileMap[filename];
					}),
					getFileModel: sandbox.spy((filename: string) => {
						return 'model';
					}),
					setFileDirty: setFileDirtyStub
				}
			};
		});

		global.monaco = {
			editor: {
				create: sandbox.spy((element: HTMLElement, options?: any) => {
					monacoEditorCreateElement = element;
					monacoEditorCreateOptions = options;
					return {
						dispose: disposeStub,
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
		onDidChangeModelContentStub.returns({
			dispose: onDidChangeModelContentDisposeStub
		});
		projectFileMap = {};
	},

	afterEach() {
		sandbox.reset();
	},

	teardown() {
		console.log('teardown Editor');
		delete global.monaco;
		sandbox.restore();
		mockHandle.destroy();
	},

	'constructor'() {
		const div = document.createElement('div');
		const editor = new Editor(div);
		assert.instanceOf(editor, Editor);
		assert.strictEqual(monacoEditorCreateElement, div, 'the passed div should strictly equal call to monaco-editor');
		assert.isUndefined(monacoEditorCreateOptions, 'options should not have been passed');
		assert.strictEqual(onDidChangeModelContentStub.callCount, 1, 'should have registered for editor changes');
	},

	'constructor with editor options'() {
		const div = document.createElement('div');
		new Editor(div, {
			theme: 'foo'
		});
		assert.deepEqual(monacoEditorCreateOptions, { theme: 'foo' }, 'should have passed editor options');
	},

	'destory calls dispose handles'() {
		const div = document.createElement('div');
		const editor = new Editor(div);
		editor.destroy();
		assert.strictEqual(disposeStub.callCount, 1, 'should have called editor.dispose()');
		assert.strictEqual(onDidChangeModelContentDisposeStub.callCount, 1, 'should have called onDidChangeModelContent.dispose()');
	},

	'display'() {
		projectFileMap['./src/foo.ts'] = true;
		const div = document.createElement('div');
		const editor = new Editor(div);
		editor.display('./src/foo.ts');
		assert.deepEqual(setModelStub.callCount, 1, 'should have called editor.setModel once');
		assert.deepEqual(setModelStub.lastCall.args, [ 'model' ], 'should have called with proper arguments');
	},

	'display missing file'() {
		projectFileMap['./src/foo.ts'] = false;
		const div = document.createElement('div');
		const editor = new Editor(div);
		assert.throws(() => {
			editor.display('./src/foo.ts');
		}, Error, 'File "./src/foo.ts" is not part of the project.');
	},

	'_onDidChangeModelContent'(this: any) {
		const dfd = this.async();
		projectFileMap['./src/foo.ts'] = true;
		const div = document.createElement('div');
		const editor = new Editor(div);
		editor.display('./src/foo.ts');
		const _onDidChangeModelContent: () => void = onDidChangeModelContentStub.lastCall.args[0];
		assert.strictEqual(setFileDirtyStub.callCount, 0, 'should not have been called');
		[ 10, 20, 30, 40, 50, 100 ].forEach((interval) => {
			setTimeout(() => {
				_onDidChangeModelContent();
			}, interval);
		});
		setTimeout(dfd.callback(() => {
			assert.strictEqual(setFileDirtyStub.callCount, 1, 'should have been called once, being debounced');
			assert.strictEqual(setFileDirtyStub.lastCall.args[0], './src/foo.ts', 'should have called with proper filename');
		}), 1500);
	}
});
