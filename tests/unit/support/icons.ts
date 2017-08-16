import * as registerSuite from 'intern!object';
import * as assert from 'intern/chai!assert';
import { load, IconResolver } from '../../../src/support/icons';

registerSuite({
	name: 'support/icons',

	'basic'() {
		assert.isFunction(load);
		assert(IconResolver);
	}
});
