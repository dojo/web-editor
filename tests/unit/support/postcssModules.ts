const { registerSuite } = intern.getInterface('object');
const { assert } = intern.getPlugin('chai');
import * as UnitUnderTest from '../../../src/support/postcssModules';

import global from '@dojo/core/global';
import loadModule from '../../support/loadModule';

registerSuite('support/postcssModules', {

	async 'global.postcssModules default return'() {
		assert.isUndefined(global.postcssModules, 'should not be defined');
		function postcssModules() {}
		global.postcssModules = postcssModules;
		const postcssModule: typeof UnitUnderTest = await loadModule('../../src/support/postcssModules');
		assert.strictEqual(postcssModule.default, postcssModules, 'should have exported the global variable');
		delete global.postcssModules;
	}
});
