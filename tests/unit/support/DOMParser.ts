import * as registerSuite from 'intern!object';
import * as assert from 'intern/chai!assert';
import DOMParser from '../../../src/support/DOMParser';

import global from '@dojo/core/global';

registerSuite({
	name: 'DOMParser',

	'validation'() {
		assert.isDefined(DOMParser, 'should be defined');
		assert.strictEqual(DOMParser, global.window && global.window.DOMParser, 'should equal global DOMParser');
	}
});
