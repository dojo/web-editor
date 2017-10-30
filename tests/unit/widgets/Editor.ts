const { registerSuite } = intern.getInterface('object');
const { assert } = intern.getPlugin('chai');
import global from '@dojo/core/global';
import { assign } from '@dojo/core/lang';
import { Constructor } from '@dojo/widget-core/interfaces';
import ProjectorMixin from '@dojo/widget-core/mixins/Projector';
import loadModule from '../../support/loadModule';
import * as css from '../../../src/styles/editor.m.css';
import UnitUnderTest, { EditorProperties } from '../../../src/widgets/Editor';

import { sandbox as sinonSandbox, SinonSandbox, SinonSpy, SinonStub } from 'sinon';

/* tslint:disable:variable-name */
let Editor: Constructor<UnitUnderTest & ProjectorMixin<EditorProperties>>;
let projector: UnitUnderTest & ProjectorMixin<EditorProperties>;

let sandbox: SinonSandbox;
let monacoEditorCreateElement: HTMLElement;
let monacoEditorCreateOptions: any;
let setModelStub: SinonStub;
let onDidChangeModelContentStub: SinonStub;
let onDidChangeModelContentDisposeStub: SinonStub;
let disposeStub: SinonStub;
let layoutStub: SinonStub;
let setFileDirtyStub: SinonStub;

function getMonacoEditor(properties: Partial<EditorProperties> = {}): Promise<monaco.editor.IStandaloneCodeEditor> {
	return new Promise((resolve, reject) => {
		function onInit(editor: monaco.editor.IStandaloneCodeEditor) {
			try {
				resolve(editor);
			}
			catch (e) {
				reject(e);
			}
		}

		projector.setProperties(assign(properties, { onInit }));
		projector.append();
	});
}

registerSuite('Editor', {

	async before() {
		sandbox = sinonSandbox.create();
		setModelStub = sandbox.stub();
		onDidChangeModelContentDisposeStub = sandbox.stub();
		onDidChangeModelContentStub = sandbox.stub();
		disposeStub = sandbox.stub();
		layoutStub = sandbox.stub();
		setFileDirtyStub = sandbox.stub();

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

		Editor = ProjectorMixin((await loadModule('../../../src/widgets/Editor', require)).default);
	},

	beforeEach() {
		projector = new Editor();
		onDidChangeModelContentStub.returns({
			dispose: onDidChangeModelContentDisposeStub
		});
	},

	afterEach() {
		sandbox.reset();
	},

	after() {
		delete global.monaco;
		sandbox.restore();
	},

	tests: {
		'expected render'() {
			projector.append();
			const vnode = projector.__render__();
			if (vnode !== null && typeof vnode === 'object' && !Array.isArray(vnode)) {
				assert.deepEqual(vnode.properties!.classes, { [css.root]: true, [css.rootFixed]: true });
				assert.strictEqual(vnode.properties!.key, 'root');
				assert.lengthOf(vnode.children!, 0);
				assert.instanceOf(vnode.domNode, global.window.HTMLDivElement);
			}
			else {
				throw new Error('vnode of wrong type');
			}
		},

		async 'editor is initalized'() {
			const editor = await getMonacoEditor();
			const createSpy = monaco.editor.create as SinonSpy;
			assert(editor, 'editor should exist');
			assert.isTrue(createSpy.called, 'create should have been called');
			assert.instanceOf(monacoEditorCreateElement, global.window.HTMLDivElement);
		},

		async 'editor passes options'() {
			await getMonacoEditor({
				options: {
					theme: 'vs-code-pretty'
				}
			} as any); // theme is now missing from editor?!
			assert.deepEqual(monacoEditorCreateOptions, { theme: 'vs-code-pretty' }, 'should pass options properly');
		},

		async 'sets the proper model'() {
			await getMonacoEditor();
			const model = {} as monaco.editor.IModel;
			projector.setProperties({ model });
			assert.isFalse(setModelStub.called, 'should not have been called yet');
			projector.__render__();
			assert.isTrue(setModelStub.called, 'should have set the model on the editor');
			assert.strictEqual(setModelStub.lastCall.args[0], model, 'should have set the proper model');
		},

		async 'setting to missing file is a no-op'() {
			await getMonacoEditor();
			projector.setProperties({});
			assert.isFalse(setModelStub.called, 'should not have been called yet');
			projector.__render__();
			assert.isFalse(setModelStub.called, 'should not have been called');
		},

		async '_onDidChangeModelContent'(this: any) {
			await getMonacoEditor();
			let onDirtyCount = 0;
			projector.setProperties({
				onDirty() {
					onDirtyCount++;
				}
			});
			projector.__render__();
			const _onDidChangeModelContent: () => void = onDidChangeModelContentStub.lastCall.args[0];
			assert.strictEqual(onDirtyCount, 0, 'should not have been called');
			[ 10, 20, 30, 40, 50, 100 ].forEach((interval) => {
				setTimeout(() => {
					_onDidChangeModelContent();
				}, interval);
			});
			return new Promise((resolve, reject) => {
				setTimeout(() => {
					try {
						assert.strictEqual(onDirtyCount, 1, 'should have been called once, being debounced');
						resolve();
					}
					catch (e) {
						reject(e);
					}
				}, 1500);
			});
		}
	}
});
