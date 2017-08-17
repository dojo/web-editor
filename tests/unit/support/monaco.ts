import * as registerSuite from 'intern!object';
import * as assert from 'intern/chai!assert';
import { loadTheme, loadMonaco } from '../../../src/support/monaco';

registerSuite({
	name: 'support/icons',

	'basic'() {
		assert.isFunction(loadTheme);
		assert.isFunction(loadMonaco);
	}
});
