const { registerSuite } = intern.getInterface('object');
const { assert } = intern.getPlugin('chai');
import global from '@dojo/shim/global';
import '../../../src/support/URL';

registerSuite('support/URL', {

	'exists'() {
		assert(global.window.URL);
	}
});
