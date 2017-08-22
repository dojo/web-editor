import registerSuite = require('intern!object');
import * as assert from 'intern/chai!assert';
import harness, { Harness } from '@dojo/test-extras/harness';
import { HNode, WidgetProperties } from '@dojo/widget-core/interfaces';
import { sandbox as sinonSandbox, SinonSandbox } from 'sinon';
import MonacoScript from '../../../src/support/MonacoScript';
import monacoStub from '../../support/monacoStub';

class MonacoScriptTest extends MonacoScript {
	protected _loadEditor: () => Promise<typeof monaco> = () => {
		return Promise.resolve(<any> monacoStub);
	}
}

let widget: Harness<WidgetProperties, typeof MonacoScriptTest>;
let sandbox: SinonSandbox;

registerSuite({
	name: 'support/MonacoScript',

	async setup() {
		sandbox = sinonSandbox.create();
	},

	beforeEach() {
		widget = harness(MonacoScriptTest);
	},

	afterEach() {
		sandbox.reset();
	},

	'renders a script tag'() {
		const render = widget.getRender() as HNode;
		assert.strictEqual(render.tag, 'script', 'should render a script tag');
	}
});
