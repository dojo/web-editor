const { registerSuite } = intern.getInterface('object');
const { assert } = intern.getPlugin('chai');
import { v } from '@dojo/widget-core/d';
import loadMonaco, { getMonaco, MonacoScript, loadTheme } from '../../../src/support/monaco';
import harness, { Harness } from '@dojo/test-extras/harness';

registerSuite('monaco', {
	tests: {
		'MonacoScript': (() => {
			let widget: Harness<MonacoScript>;

			return {
				beforeEach() {
					widget = harness(MonacoScript);
				},

				afterEach() {
					widget.destroy();
				},

				'basic rendering'() {
					const loaderPath = 'test';

					const expected = v('script', {
						src: loaderPath,
						onload() {},
						onerror() {}
					});

					widget.setProperties({ loaderPath });

					widget.expectRender(expected);
				}
			};
		})(),
		'methods': {
			'basic'() {
				assert.isFunction(loadTheme);
				assert.isFunction(loadMonaco);
				assert.isFunction(getMonaco);
			},
			'load should always return the same Promise'() {
				const p = loadMonaco();
				assert.strictEqual(loadMonaco(), p);
			},
			'getMonaco should return the same Promise'() {
				const p = getMonaco();
				assert.strictEqual(getMonaco(), p);
			}
		}
	}
});
