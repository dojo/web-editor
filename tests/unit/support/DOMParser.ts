const { registerSuite } = intern.getInterface('object');
const { assert } = intern.getPlugin('chai');
import DOMParser from '../../../src/support/DOMParser';

import global from '@dojo/core/global';

registerSuite('DOMParser', {

	'validation'() {
		assert.isDefined(DOMParser, 'should be defined');
		assert.strictEqual(DOMParser, global.window && global.window.DOMParser, 'should equal global DOMParser');
	}
});
