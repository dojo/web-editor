import * as registerSuite from 'intern!object';
import harness from '@dojo/test-extras/harness';
import { v } from '@dojo/widget-core/d';
import * as css from '../../../src/styles/scrollbar.m.css';
import ScrollBar from '../../../src/support/ScrollBar';

registerSuite({
	name: 'support/ScrollBar',

	'basic rendering'() {
		const widget = harness(ScrollBar);

		const expected = v('div', {
			classes: widget.classes(css.root, css.vertical, css.invisible),
			key: 'scrollbar',

			onmouseenter: widget.listener,
			onmouseleave: widget.listener
		}, [
			v('div', {
				classes: widget.classes(css.slider),
				key: 'slider',
				styles: {
					height: '10px',
					top: '0px'
				},

				onmousedown: widget.listener,
				onmousemove: widget.listener,
				onmouseup: widget.listener,
				ontouchstart: widget.listener,
				ontouchmove: widget.listener,
				ontouchend: widget.listener
			} as any)
		]);

		widget.expectRender(expected);

		widget.destroy();
	}
});
