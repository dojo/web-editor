const { registerSuite } = intern.getInterface('object');
const { assert } = intern.getPlugin('chai');
import { load } from '../../../src/support/editorThemes';

registerSuite('support/editorThemes', {

	'basic'() {
		assert.isFunction(load);
	}
});
