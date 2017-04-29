import * as registerSuite from 'intern!object';
import * as assert from 'intern/chai!assert';
import { getEmit } from '../../../src/support/json';

import { ProjectFileType } from '@dojo/cli-export-project/interfaces/project.json';

registerSuite({
	name: 'support/json',

	'getEmit()': {
		'can take a single argument'() {
			const text = JSON.stringify({ foo: 'bar' });
			const file = {
				name: './src/foo.json',
				text,
				type: ProjectFileType.JSON
			};
			const emit = getEmit(file);
			assert.lengthOf(emit, 1);
			assert.strictEqual(emit[0].name, './src/foo.json.js');
			assert.strictEqual(emit[0].text, `define([], function () { return '${text}'; });`);
			assert.strictEqual(emit[0].type, ProjectFileType.JavaScript);
		},

		'can take multiple arguments'() {
			const filea = {
				name: './src/bar.json',
				text: JSON.stringify({ bar: 1 }),
				type: ProjectFileType.JSON
			};
			const text = JSON.stringify({ foo: 'bar' });
			const fileb = {
				name: './src/foo.json',
				text,
				type: ProjectFileType.JSON
			};
			const emit = getEmit(filea, fileb);
			assert.lengthOf(emit, 2);
			assert.strictEqual(emit[1].name, './src/foo.json.js');
			assert.strictEqual(emit[1].text, `define([], function () { return '${text}'; });`);
			assert.strictEqual(emit[1].type, ProjectFileType.JavaScript);
		}
	}
});
