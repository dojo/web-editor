const { registerSuite } = intern.getInterface('object');
const { assert } = intern.getPlugin('chai');
import loadModule from '../support/loadModule';

import { enable, register } from '../support/mock';

let handle: any;
let main: any;

let project: any;
let routing: any;
/* tslint:disable:variable-name */
let Workbench: any;

registerSuite('main', {

	async before() {
		project = {};
		routing = {};
		Workbench = {};

		register('dev/src/project', {
			default: project
		});
		register('dev/src/routing', routing);
		register('dev/src/Workbench', {
			default: Workbench
		});
		handle = enable();

		main = await loadModule('../../src/main', require);
	},

	after() {
		handle.destroy();
	},

	tests: {
		async 'validate API'() {
			assert.strictEqual(main.project, project);
			assert.strictEqual(main.routing, routing);
			assert.strictEqual(main.Workbench, Workbench);
			assert.lengthOf(Object.keys(main), 4, 'should have only 3 exports');
		}
	}
});
