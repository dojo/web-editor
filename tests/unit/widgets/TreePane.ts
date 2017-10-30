const { registerSuite } = intern.getInterface('object');
import harness from '@dojo/test-extras/harness';
import { v, w } from '@dojo/widget-core/d';
import TreePane from '../../../src/widgets/TreePane';
import * as css from '../../../src/styles/treepane.m.css';
import ScrollBar from '../../../src/widgets/ScrollBar';

registerSuite('TreePane', {

	'basic rendering'() {
		const widget = harness(TreePane);

		const expected = v('div', {
			'aria-hidden': false,
			'aria-label': undefined,
			classes: widget.classes(css.root),
			key: undefined,
			role: 'tree',

			onmouseenter: widget.listener,
			onmouseleave: widget.listener
		}, [
			v('div', {
				classes: widget.classes(css.scroll),
				key: 'rows',
				role: 'presentation',
				styles: {
					top: String(0) + 'px'
				},
				tabIndex: 0,

				onkeydown: widget.listener,
				onwheel: widget.listener
			}, []),
			w(ScrollBar, {
				position: 0,
				size: 0,
				sliderSize: 0,
				visible: false,
				theme: undefined,

				onScroll: widget.listener
			})
		]);

		widget.expectRender(expected);

		widget.destroy();
	}
});
