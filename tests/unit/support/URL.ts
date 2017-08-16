import * as registerSuite from 'intern!object';
import * as assert from 'intern/chai!assert';
import global from '@dojo/shim/global';
import '../../../src/support/URL';

registerSuite({
	name: 'support/URL',

	'exists'() {
		assert(global.window.URL);
	}
});
