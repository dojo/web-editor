const { registerSuite } = intern.getInterface('object');
const { assert } = intern.getPlugin('chai');
import harness from '@dojo/test-extras/harness';
import { v } from '@dojo/widget-core/d';
import { HNode } from '@dojo/widget-core/interfaces';
import IconCss from '../../../src/widgets/IconCss';
import icons from '../../support/iconJson';

registerSuite('IconCss', {

	'rendering'() {
		const widget = harness(IconCss);

		widget.expectRender(v('style', {
			media: 'screen',
			type: 'text/css'
		}, [ null ]));

		widget.destroy();
	},

	'with icons'() {
		const widget = harness(IconCss);

		widget.setProperties({
			baseClass: 'foo',
			icons,
			sourcePath: 'https://example.com/path/to/icons'
		});

		const render = widget.getRender() as HNode;

		assert.include(render.children[0] as string, '.foo._file_json::before');
	}
});
