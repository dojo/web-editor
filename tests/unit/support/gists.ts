import * as registerSuite from 'intern!object';
import * as assert from 'intern/chai!assert';
import loadModule from '../../support/loadModule';
import { enable, register } from '../../support/mock';
import * as UnitUnderTest from '../../../src/support/gists';
import requestStub, { responseMap } from '../../support/requestStub';

let gists: typeof UnitUnderTest;
let getById: typeof UnitUnderTest.getById;
let getByUsername: typeof UnitUnderTest.getByUsername;

let mockHandle: any;

registerSuite({
	name: 'gists',

	async setup() {
		register('@dojo/core/request', {
			default: requestStub
		});

		mockHandle = enable();
		gists = await loadModule('../../src/support/gists');
		getById = gists.getById;
		getByUsername = gists.getByUsername;
	},

	teardown() {
		mockHandle.destroy();
	},

	beforeEach() {
		responseMap.clear();
	},

	'getById()': {
		async 'resolves with data'() {
			responseMap.set('https://api.github.com/gists/foobar', JSON.stringify({
				description: 'Foo Bar Gist',
				files: {
					'README.md': { filename: 'README.md', type: 'text/markdown', 'raw_url': 'https://gist.githubusercontent.com/foobar/README.md' },
					'project.json': { filename: 'project.json', type: 'application/json', 'raw_url': 'https://gist.githubusercontent.com/foobar/project.json' }
				}
			}));
			const result = await getById('foobar');
			assert.deepEqual(result, {
				description: 'Foo Bar Gist',
				projectJson: 'https://rawgit.com/foobar/project.json'
			});
		},

		async 'skips wrong mime types'() {
			responseMap.set('https://api.github.com/gists/foobar', JSON.stringify({
				description: 'Foo Bar Gist',
				files: {
					'project.json': { filename: 'project.json', type: 'test/markdown', 'raw_url': 'https://gist.githubusercontent.com/foobar/project.json' }
				}
			}));
			const result = await getById('foobar');
			assert.isUndefined(result);
		},

		async 'missing gist'() {
			const result = await getById('foobar');
			assert.isUndefined(result);
		}
	},

	'getByUsername()': {
		async 'resolves with data'() {
			responseMap.set('https://api.github.com/users/foo/gists', JSON.stringify([ {
				description: 'Foo Bar Gist',
				id: 'foobar',
				files: {
					'README.md': { filename: 'README.md', type: 'text/markdown', 'raw_url': 'https://gist.githubusercontent.com/foobar/README.md' },
					'project.json': { filename: 'project.json', type: 'application/json', 'raw_url': 'https://gist.githubusercontent.com/foobar/project.json' }
				}
			} ]));
			const result = await getByUsername('foo');
			assert.deepEqual(result, [ {
				description: 'Foo Bar Gist',
				id: 'foobar',
				projectJson: 'https://rawgit.com/foobar/project.json'
			} ]);
		},

		async 'skips wrong mime type'() {
			responseMap.set('https://api.github.com/users/foo/gists', JSON.stringify([ {
				description: 'Foo Bar Gist',
				id: 'foobar',
				files: {
					'project.json': { filename: 'project.json', type: 'text/markdown', 'raw_url': 'https://gist.githubusercontent.com/foobar/project.json' }
				}
			} ]));
			const result = await getByUsername('foo');
			assert.deepEqual(result, []);
		},

		async 'user not found'() {
			const result = await getByUsername('foo');
			assert.deepEqual(result, []);
		}
	}
});
