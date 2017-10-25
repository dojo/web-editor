import * as registerSuite from 'intern!object';
import * as assert from 'intern/chai!assert';
import loadModule from '../support/loadModule';

import { enable, register } from '../support/mock';

let handle: any;
let main: any;

let project: any;
let routing: any;
/* tslint:disable:variable-name */
let Workbench: any;

registerSuite({
	name: 'main',

	async setup() {
		project = {};
		routing = {};
		Workbench = {};

		register('src/project', {
			default: project
		});
		register('src/routing', routing);
		register('src/Workbench', {
			default: Workbench
		});
		handle = enable();

		main = await loadModule('../../src/main', require);
	},

	teardown() {
		handle.destroy();
	},

	async 'validate API'() {
		assert.strictEqual(main.project, project);
		assert.strictEqual(main.routing, routing);
		assert.strictEqual(main.Workbench, Workbench);
		assert.lengthOf(Object.keys(main), 3, 'should have only 3 exports');
	}
});
