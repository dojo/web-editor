import * as registerSuite from 'intern!object';
import * as assert from 'intern/chai!assert';
import { load } from '../../../src/support/editorThemes';

registerSuite({
	name: 'support/icons',

	'basic'() {
		assert.isFunction(load);
	}
});
