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

registerSuite({
	name: 'main',

	async setup() {
		project = function project() { };
		register('src/project', {
			default: project
		});
		handle = enable();

		Editor = (await loadModule('../../src/Editor')).default;
		Runner = (await loadModule('../../src/Runner')).default;

		main = await loadModule('../../src/main');
	},

	teardown() {
		handle.destroy();
	},

	async 'validate API'() {
		assert.strictEqual(main.Editor, Editor);
		assert.strictEqual(main.project, project);
		assert.strictEqual(main.Runner, Runner);
		assert.lengthOf(Object.keys(main), 3, 'should have only 3 exports');
	}
});
