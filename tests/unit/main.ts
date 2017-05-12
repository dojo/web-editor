import * as registerSuite from 'intern!object';
import * as assert from 'intern/chai!assert';
import loadModule from '../support/loadModule';

import { enable, register } from '../support/mock';

let handle: any;
let main: any;

/* tslint:disable:variable-name */
let Editor: any;
let project: any;
let Runner: any;
let routing: any;

registerSuite({
	name: 'main',

	async setup() {
		Editor = {};
		project = {};
		routing = {};
		Runner = {};

		register('src/Editor', {
			default: Editor
		});
		register('src/project', {
			default: project
		});
		register('src/routing', routing);
		register('src/Runner', {
			default: Runner
		});
		handle = enable();

		main = await loadModule('../../src/main', require);
	},

	teardown() {
		handle.destroy();
	},

	async 'validate API'() {
		assert.strictEqual(main.Editor, Editor);
		assert.strictEqual(main.project, project);
		assert.strictEqual(main.routing, routing);
		assert.strictEqual(main.Runner, Runner);
		assert.lengthOf(Object.keys(main), 4, 'should have only 3 exports');
	}
});
