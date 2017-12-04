const { registerSuite } = intern.getInterface('object');
const { assert } = intern.getPlugin('chai');
import { ProjectJson, ProjectFileType } from '@dojo/cli-export-project/interfaces/project.json';
import global from '@dojo/core/global';
import loadModule from '../support/loadModule';
import { enable, register } from '../support/mock';
import UnitUnderTest from '../../src/project';

import { stub } from 'sinon';
import cssStub, { definitionMap } from '../support/cssStub';
import jsonStub from '../support/jsonStub';
import monacoStub, { compilerOptionsDiagnostics, outputFilesMap, resetSandbox, setCompilerOptionsSpy } from '../support/monacoStub';
import requestStub, { responseMap } from '../support/requestStub';

let project: typeof UnitUnderTest;
let mockHandle: { destroy(): void; };
let projectJson: ProjectJson;

const testJS = `define(["require", "exports"], function (require, exports) {
    "use strict";
    exports.__esModule = true;
    function foo() { console.log('bar'); }
    exports.foo = foo;
    ;
});
`;

const testMap = `{"version":3,"file":"test.js","sourceRoot":"","sources":["test.ts"],"names":[],"mappings":";;;IAAA,iBAAwB,OAAO,CAAC,GAAG,CAAC,KAAK,CAAC,CAAC,CAAC,CAAC;IAA7C,kBAA6C;IAAA,CAAC","sourcesContent":["export function foo() { console.log('bar'); };\\n"]}`;

registerSuite('project', {

	async before() {
		register('@dojo/core/request', {
			default: requestStub
		});
		register('vs/editor/editor.main', {});
		register('dev/src/support/css', cssStub);
		register('dev/src/support/json', jsonStub);

		global.monaco = monacoStub;

		mockHandle = enable();
		project = (await loadModule('../../src/project')).default;
	},

	after() {
		global.monaco = undefined;
		mockHandle.destroy();
	},

	beforeEach() {
		projectJson = {
			tsconfig: {
				compilerOptions: {
					target: 'es5'
				}
			},
			environmentFiles: [
				{ name: 'foo.d.ts', type: ProjectFileType.Definition, text: `export const foo: 'foo';\n` },
				{ name: 'lib.es2016.d.ts', type: ProjectFileType.Lib, text: `export const foo: 'foo';\n` }
			],
			files: [
				{ name: 'src/interfaces.d.ts', type: ProjectFileType.Definition, text: `export interface Foo { };\n` },
				{ name: 'src/main.ts', type: ProjectFileType.TypeScript, text: `console.log('foobar');\n` },
				{ name: 'src/index.html', type: ProjectFileType.HTML, text: `<!DOCTYPE html><html></html>` },
				{ name: 'src/main.css', type: ProjectFileType.CSS, text: `.foo { font-size: 48px; }` },
				{ name: 'src/main.css.d.ts', type: ProjectFileType.Definition, text: `export const foo: string;\n` },
				{ name: 'src/theme.css', type: ProjectFileType.CSS, text: `.bar { font-size: 48px; }` },
				{ name: 'src/messages.json', type: ProjectFileType.JSON, text: `{"foo":true}`}
			],
			dependencies: {
				production: {
					'foo': '1.0.0'
				},
				development: {
					'bar': '0.5.0'
				}
			},
			index: 'src/index.html',
			package: {}
		};
		responseMap.set('project.json', projectJson);
	},

	async afterEach() {
		responseMap.clear();
		resetSandbox();
		project = (await loadModule('../../src/project')).default;
	},

	tests: {
		async 'load'() {
			await project.load('project.json');
			assert.isTrue(setCompilerOptionsSpy.called);
			assert.deepEqual(setCompilerOptionsSpy.lastCall.args[0], {
				experimentalDecorators: undefined,
				lib: undefined,
				jsx: 0,
				jsxFactory: undefined,
				noImplicitAny: undefined,
				noImplicitThis: undefined,
				noImplicitReturns: undefined,
				noLib: undefined,
				noUnusedLocals: undefined,
				noUnusedParameters: undefined,
				strictNullChecks: undefined,
				target: 1,
				types: undefined,
				allowNonTsExtensions: true,
				inlineSources: true,
				module: 2,
				moduleResolution: 2,
				noEmitHelpers: true,
				sourceMap: true
			});
		},

		async 'isLoaded()'() {
			assert.isFalse(project.isLoaded(), 'project should not be loaded');
			await project.load('project.json');
			assert.isTrue(project.isLoaded(), 'project should be loaded');
		},

		async 'get()'() {
			await project.load('project.json');
			await project.setFileDirty('src/main.ts');
			const projectJson = project.get();
			assert.deepEqual(projectJson!.tsconfig, { compilerOptions: { target: 'es5' } });
			assert.deepEqual(projectJson!.environmentFiles.length, 2);
			assert.deepEqual(projectJson!.files.length, 7);
		},

		'getFile()': {
			async 'is part of project'() {
				await project.load('project.json');
				const file = project.getFile('src/main.ts');
				assert.deepEqual(file, {
					name: 'src/main.ts',
					type: ProjectFileType.TypeScript,
					text: `console.log('foobar');\n`
				}, 'should be a project file');
			},

			async 'is not part of project'() {
				await project.load('project.json');
				assert.isUndefined(project.getFile('foo.bar'));
			}
		},

		'getFiles()': {
			async 'no file types'() {
				await project.load('project.json');
				const files = project.getFiles();
				assert.deepEqual(files, [
					{ name: 'src/interfaces.d.ts', type: ProjectFileType.Definition, text: 'export interface Foo { };\n' },
					{ name: 'src/main.ts', type: ProjectFileType.TypeScript, text: 'console.log(\'foobar\');\n' },
					{ name: 'src/index.html', type: ProjectFileType.HTML, text: '<!DOCTYPE html><html></html>' },
					{ name: 'src/main.css', type: ProjectFileType.CSS, text: '.foo { font-size: 48px; }' },
					{ name: 'src/theme.css', type: ProjectFileType.CSS, text: '.bar { font-size: 48px; }' },
					{ name: 'src/messages.json', type: ProjectFileType.JSON, text: `{"foo":true}`}
				], 'files should match');
			},

			async 'file type provided'() {
				await project.load('project.json');
				const files = project.getFiles(ProjectFileType.TypeScript);
				assert.deepEqual(files, [
					{ name: 'src/main.ts', type: ProjectFileType.TypeScript, text: 'console.log(\'foobar\');\n' }
				], 'only typescript files should be returned');
			}
		},

		'getFileNames()': {
			async 'no file types'() {
				await project.load('project.json');
				const files = project.getFileNames();
				assert.deepEqual(files, [
					'src/interfaces.d.ts',
					'src/main.ts',
					'src/index.html',
					'src/main.css',
					'src/theme.css',
					'src/messages.json'
				], 'correct filenames should be returned');
			},

			async 'file type provided'() {
				await project.load('project.json');
				const files = project.getFileNames(ProjectFileType.HTML);
				assert.deepEqual(files, [ 'src/index.html' ], 'only html files should be returned');
			}
		},

		async 'includes()'() {
			await project.load('project.json');
			assert.isTrue(project.includes('src/main.ts'), 'should return true');
			assert.isFalse(project.includes('src/foo.ts'), 'should return false');
		},

		async 'getFileModel()'() {
			await project.load('project.json');
			const model1 = project.getFileModel('src/main.ts');
			const model2 = project.getFileModel('src/main.ts');
			assert.strictEqual(model1, model2, 'should always return the same model');

			assert.throws(() => {
				project.getFileModel('src/foo.ts');
			}, Error, 'File "src/foo.ts" is not part of the project.');
		},

		async 'getFileText()'() {
			await project.load('project.json');
			assert.strictEqual(project.getFileText('src/main.ts'), `console.log('foobar');\n`, 'should contain proper text');
		},

		async 'getIndexHtml()'() {
			await project.load('project.json');
			assert.strictEqual(project.getIndexHtml(), '<!DOCTYPE html><html></html>', 'should return index HTML');
		},

		async 'isFileDirty()/setFileDirty()'() {
			await project.load('project.json');
			assert.isFalse(project.isFileDirty('src/main.ts'), 'should not be dirty');
			await project.setFileDirty('src/main.ts');
			assert.isTrue(project.isFileDirty('src/main.ts'), 'should now be dirty');

			assert.strictEqual(project.getFileText('src/main.css.d.ts'), 'export const foo: string;\n', 'should have proper initial text');
			const mainCssFile = project.getFile('src/main.css');
			definitionMap.set(mainCssFile!, {
				name: 'src/main.css.d.ts',
				text: 'export const bar: string;\n',
				type: ProjectFileType.Definition
			});
			await project.setFileDirty('src/main.css');
			assert.strictEqual(project.getFile('src/main.css.d.ts')!.text, 'export const bar: string;\n', 'should have updated text');

			assert.isUndefined(project.getFile('src/theme.css.d.ts'), 'should not have a definition file for theme.css');
			const themeCssFile = project.getFile('src/theme.css');
			definitionMap.set(themeCssFile!, {
				name: 'src/theme.css.d.ts',
				text: 'export const bar: string;\n',
				type: ProjectFileType.Definition
			});
			await project.setFileDirty('src/theme.css');
			assert.strictEqual(project.getFile('src/theme.css.d.ts')!.text, 'export const bar: string;\n', 'should have file with proper text');

			let didThrow = false;
			try {
				await project.setFileDirty('src/foo.ts');
			}
			catch (e) {
				didThrow = true;
				assert.instanceOf(e, Error, 'should be an error');
				assert.strictEqual(e.message, 'File "src/foo.ts" is not part of the project.');
			}
			assert.isTrue(didThrow, 'setFileDirty should have thrown');
		},

		async 'getDependencies()'() {
			await project.load('project.json');
			assert.deepEqual(project.getDependencies(), {
				'foo': '1.0.0'
			});
			assert.deepEqual(project.getDependencies(true), {
				'foo': '1.0.0',
				'bar': '0.5.0'
			});
		},

		async 'emit()'() {
			await project.load('project.json');
			const emit = await project.emit();
			assert.lengthOf(emit, 6, 'should have correct number of files emitted');
		},

		async 'emit() with diagnostic errors'() {
			await project.load('project.json');
			const warnSpy = stub(console, 'warn');
			compilerOptionsDiagnostics.push({
				file: {
					getLineAndCharacterOfPosition() {
						return { line: 0, character: 0 };
					},
					name: 'foo'
				} as any,
				start: 0,
				length: 0,
				messageText: 'foo',
				category: 1,
				code: 0
			});
			compilerOptionsDiagnostics.push({
				file: undefined as any,
				start: 0,
				length: 0,
				messageText: {
					messageText: 'Error foo',
					category: 1,
					code: 0,
					next: {
						messageText: 'Error bar',
						category: 1,
						code: 0
					}
				},
				category: 1,
				code: 0
			});
			await project.emit();
			assert.strictEqual(warnSpy.lastCall.args[0], 'Error: Error foo\n  Error bar');
			warnSpy.restore();
		},

		async 'getProgram()'() {
			await project.load('project.json');
			outputFilesMap.set('file:///src/main.ts', [
				{
					name: 'file:///src/main.js',
					writeByteOrderMark: false,
					text: testJS
				}, {
					name: 'file:///src/main.js.map',
					writeByteOrderMark: false,
					text: testMap
				}
			]);
			const program = await project.getProgram();
			assert.deepEqual(program, {
				css: [
					{
						name: 'file:///src/main.css',
						text: '.foo { font-size: 48px; }'
					}, {
						name: 'file:///src/theme.css',
						text: '.bar { font-size: 48px; }'
					}
				],
				dependencies: { foo: '1.0.0' },
				html: '<!DOCTYPE html><html></html>',
				modules: {
					'': { code: '', map: '' },
					'src/main': { code: testJS, map: testMap }
				}
			});
		},

		'error conditions': {
			async 'load when already loaded'() {
				await project.load('project.json');
				let didThrow = false;
				try {
					await project.load('project.json');
				}
				catch (e) {
					didThrow = true;
					assert.instanceOf(e, Error);
					assert.strictEqual(e.message, 'Project is already loaded.');
				}
				assert.isTrue(didThrow, 'should have thrown');
			},

			async 'emit() throws'() {
				let didThrow = false;
				try {
					await project.emit();
				}
				catch (e) {
					didThrow = true;
					assert.instanceOf(e, Error);
					assert.strictEqual(e.message, 'Project not loaded.');
				}
				assert.isTrue(didThrow, 'should have thrown');
			},

			async 'getIndexHtml() throws'() {
				assert.throws(() => {
					project.getIndexHtml();
				}, Error, 'Project not loaded.');
			},

			async 'getDependencies() throws'() {
				assert.throws(() => {
					project.getDependencies();
				}, Error, 'Project not loaded.');
			},

			async 'getFile() throws'() {
				assert.throws(() => {
					project.getFile('foo.bar');
				}, Error, 'Project not loaded.');
			},

			async 'getFiles() throws'() {
				assert.throws(() => {
					project.getFiles();
				}, Error, 'Project not loaded.');
			},

			async 'get() is undefined'() {
				assert.isUndefined(project.get(), 'should retrun undefined when unloaded');
			}
		}
	}
});
