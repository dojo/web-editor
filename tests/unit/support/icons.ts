const { registerSuite } = intern.getInterface('object');
const { assert } = intern.getPlugin('chai');
import { load, IconResolver } from '../../../src/support/icons';

registerSuite('support/icons', {

	'basic'() {
		assert.isFunction(load);
		assert(IconResolver);
	}
});
