import * as registerSuite from 'intern!object';
import * as assert from 'intern/chai!assert';
import loadModule from '../support/loadModule';
import { enable, register } from '../support/mock';
import * as UnitUnderTest from '../../src/routing';
import HashHistoryStub from '../support/HashHistoryStub';
import RouteStub from '../support/RouteStub';
import RouterStub, { currentPath, currentRouter } from '../support/RouterStub';

let setPath: typeof UnitUnderTest.setPath;
let startGistRouter: typeof UnitUnderTest.startGistRouter;

let mockHandle: { destroy(): void; };

registerSuite({
	name: 'routing',

	async setup() {
		register('@dojo/routing/history/HashHistory', {
			default: HashHistoryStub
		});
		register('@dojo/routing/Route', {
			default: RouteStub
		});
		register('@dojo/routing/Router', {
			default: RouterStub
		});

		mockHandle = enable();
		const routing: typeof UnitUnderTest = await loadModule('../../src/routing');
		setPath = routing.setPath;
		startGistRouter = routing.startGistRouter;
	},

	teardown() {
		mockHandle.destroy();
	},

	afterEach() {
		currentRouter.__reset__();
	},

	'setPath()': {
		'is a function'() {
			assert.isFunction(setPath, 'should be a function');
		},

		'changes the location'() {
			setPath('foobar');
			assert.strictEqual(currentPath, 'foobar');
		}
	},

	'startGistRouter()': {
		'calls root callback'() {
			let called = false;
			const handle = startGistRouter({
				onGist() {
					throw new Error('Unexpected Path');
				},
				onRoot() {
					called = true;
				}
			});
			setPath('');
			assert.isTrue(called);
			handle.destroy();
		},

		'calls on gist callback'() {
			let called = false;
			const handle = startGistRouter({
				onGist(request) {
					called = true;
					assert.strictEqual(request.params.id, 'foobar');
				},
				onRoot() {
					throw new Error('Unexpected Path');
				}
			});
			setPath('foobar');
			assert.isTrue(called);
			handle.destroy();
		}
	}
});
