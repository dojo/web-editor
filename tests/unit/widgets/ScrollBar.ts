const { registerSuite } = intern.getInterface('object');
import harness from '@dojo/test-extras/harness';
import { v } from '@dojo/widget-core/d';
import * as css from '../../../src/styles/scrollbar.m.css';
import ScrollBar from '../../../src/widgets/ScrollBar';

registerSuite('support/ScrollBar', {

	'basic rendering'() {
		const widget = harness(ScrollBar);

		const expected = v('div', {
			classes: [ css.root, css.rootFixed, css.vertical, css.verticalFixed, css.invisible, css.invisibleFixed ],
			key: 'root',

			onclick: widget.listener,
			onpointerenter: widget.listener,
			onpointerleave: widget.listener
		}, [
			v('div', {
				classes: [ css.slider, css.sliderFixed ],
				key: 'slider',
				styles: {
					height: '10px',
					top: '0px'
				}
			} as any)
		]);

		widget.expectRender(expected);

		widget.destroy();
	}
});
