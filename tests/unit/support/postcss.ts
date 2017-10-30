const { registerSuite } = intern.getInterface('object');
const { assert } = intern.getPlugin('chai');
import * as UnitUnderTest from '../../../src/support/postcss';

import global from '@dojo/core/global';
import loadModule from '../../support/loadModule';

registerSuite('support/postcss', {

	async 'global.postcss default return'() {
		assert.isUndefined(global.postcss, 'should not be defined');
		function postcss() {}
		global.postcss = postcss;
		const postcssModule: typeof UnitUnderTest = await loadModule('../../src/support/postcss');
		assert.strictEqual(postcssModule.default, postcss, 'should have exported the global variable');
		delete global.postcss;
	}
});
