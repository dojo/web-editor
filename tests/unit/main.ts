const { registerSuite } = intern.getInterface('object');
const { assert } = intern.getPlugin('chai');
import loadModule from '../support/loadModule';

import { enable, register } from '../support/mock';

let handle: any;
let main: any;

/* tslint:disable:variable-name */
let Editor: any;
let project: any;
let Runner: any;
let routing: any;

registerSuite('main', {

	async before() {
		Editor = {};
		project = {};
		routing = {};
		Runner = {};

		register('dev/src/Editor', {
			default: Editor
		});
		register('dev/src/project', {
			default: project
		});
		register('dev/src/routing', routing);
		register('dev/src/Runner', {
			default: Runner
		});
		handle = enable();

		main = await loadModule('../../src/main', require);
	},

	after() {
		handle.destroy();
	},

	tests: {
		async 'validate API'() {
			assert.strictEqual(main.Editor, Editor);
			assert.strictEqual(main.project, project);
			assert.strictEqual(main.routing, routing);
			assert.strictEqual(main.Runner, Runner);
			assert.lengthOf(Object.keys(main), 4, 'should have only 3 exports');
		}
	}
});
