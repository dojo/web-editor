import * as registerSuite from 'intern!object';
import * as assert from 'intern/chai!assert';
import loadModule from '../../../support/loadModule';
import UnitUnderTest from '../../../../src/support/providers/amdRequire';

import { sandbox as sinonSandbox, SinonStub, SinonSandbox } from 'sinon';

let getProvider: typeof UnitUnderTest;

let sandbox: SinonSandbox;
let xhrStub: SinonStub;
let requireStub: NodeRequire;
let moduleMap: { [mid: string]: any } = {};

registerSuite({
	name: 'support/providers/amdRequire',

	async setup() {
		sandbox = sinonSandbox.create();

		getProvider = (await loadModule('../../../../src/support/providers/amdRequire', require)).default;
		const xhrModule = await loadModule('@dojo/core/request/providers/xhr');
		xhrStub = sandbox.stub(xhrModule, 'default');
		requireStub = <any> sandbox.spy((dependencies: string[], callback: (...modules: any[]) => void) => {
			const modules = dependencies.map((mid) => {
				if (!(mid in moduleMap)) {
					moduleMap[mid] = {};
				}
				if (mid === 'bad') {
					throw new Error('Failed to load module "bad"');
				}
				return moduleMap[mid];
			});
			callback(...modules);
		});
	},

	teardown() {
		sandbox.restore();
	},

	afterEach() {
		sandbox.reset();
		moduleMap = {};
	},

	'getProvider()'() {
		assert.isFunction(getProvider, 'default export should be a function');
		const amdProvider = getProvider();
		assert.isFunction(amdProvider, 'should return a function');
		const localAmdProvider = getProvider(require);
		assert.isFunction(localAmdProvider, 'should be able to return a function passing a context require');
	},

	'amdProvider()': {
		'passes through to xhr for "http://"'() {
			const amdProvider = getProvider();
			xhrStub.returns('foo');
			assert.isFalse(xhrStub.called, 'xhr stub should not have been called');
			const result = amdProvider('http://example.com/');
			assert.isTrue(xhrStub.called, 'xhr stub should have been called');
			assert.strictEqual(result, 'foo', 'should have called the xhr stub');
		},

		'passes through to xhr for "https://"'() {
			const amdProvider = getProvider();
			xhrStub.returns('foo');
			assert.isFalse(xhrStub.called, 'xhr stub should not have been called');
			const result = amdProvider('https://example.com/');
			assert.isTrue(xhrStub.called, 'xhr stub should have been called');
			assert.strictEqual(result, 'foo', 'should have called the xhr stub');
		},

		async 'detects i18n URLs'() {
			const amdProvider = getProvider(requireStub);
			const result = await amdProvider('https://unpkg.com/@dojo/i18n@beta1/cldr/foo/bar');
			const data = await result.json();
			assert.deepEqual(data, { }, 'should have return an empty object');
			assert.property(moduleMap, 'src/foo/bar', 'should have remapped module');
			assert.strictEqual(Object.keys(moduleMap).length, 1, 'only called one module');
		},

		async 'loads local resources'() {
			moduleMap['src/qat.json'] = '{ "some": { "json": 3 } }';
			const amdProvider = getProvider(requireStub);
			const result = await amdProvider('src/qat.json');
			const data = await result.json();
			assert.deepEqual(data, { some: { json: 3 } }, 'should have returned the expected object');
			assert.strictEqual(Object.keys(moduleMap).length, 1, 'only called one module');
		}
	},

	'response': {
		'text()': {
			async 'source string'() {
				moduleMap['src/foo'] = 'foo';
				const amdProvider = getProvider(requireStub);
				const result = await amdProvider('src/foo');
				const data = await result.text();
				assert.strictEqual(data, 'foo');
			},

			async 'source object'() {
				moduleMap['src/foo'] = {};
				const amdProvider = getProvider(requireStub);
				const result = await amdProvider('src/foo');
				const data = await result.text();
				assert.strictEqual(data, '[object Object]');
			}
		},

		'json()': {
			async 'source string'() {
				moduleMap['src/foo'] = '{ "foo": 1 }';
				const amdProvider = getProvider(requireStub);
				const result = await amdProvider('src/foo');
				const data = await result.json();
				assert.deepEqual(data, { foo: 1 });
			},

			async 'source object'() {
				moduleMap['src/foo'] = { foo: 1 };
				const amdProvider = getProvider(requireStub);
				const result = await amdProvider('src/foo');
				const data = await result.json();
				assert.deepEqual(data, { foo: 1 });
			}
		},

		async 'arrayBuffer()'(this: any) {
			const dfd = this.async();
			const amdProvider = getProvider(requireStub);
			const result = await amdProvider('src/foo');
			result.arrayBuffer()
				.then(() => {
					throw new Error('Unexpected');
				}, dfd.callback((e: Error) => {
					assert.instanceOf(e, Error);
					assert.strictEqual(e.message, 'ArrayBuffer not supported');
				}));
		},

		async 'blob()'(this: any) {
			const dfd = this.async();
			const amdProvider = getProvider(requireStub);
			const result = await amdProvider('src/foo');
			result.blob()
				.then(() => {
					throw new Error('Unexpected');
				}, dfd.callback((e: Error) => {
					assert.instanceOf(e, Error);
					assert.strictEqual(e.message, 'ArrayBuffer not supported');
				}));
		},

		async 'formData()'(this: any) {
			const dfd = this.async();
			const amdProvider = getProvider(requireStub);
			const result = await amdProvider('src/foo');
			result.formData()
				.then(() => {
					throw new Error('Unexpected');
				}, dfd.callback((e: Error) => {
					assert.instanceOf(e, Error);
					assert.strictEqual(e.message, 'ArrayBuffer not supported');
				}));
		}
	},

	'error conditions': {
		'failure to load module should reject'(this: any) {
			const dfd = this.async();
			const amdProvider = getProvider(requireStub);
			amdProvider('bad')
				.then(() => {
					throw Error('Unexpected');
				}, dfd.callback((e: any) => {
					assert.instanceOf(e, Error, 'should have rejected an error');
				}));
		}
	}
});
