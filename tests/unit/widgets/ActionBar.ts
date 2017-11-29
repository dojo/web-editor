const { registerSuite } = intern.getInterface('object');
import harness from '@dojo/test-extras/harness';
import { v } from '@dojo/widget-core/d';
import ActionBar, { ActionBarButton } from '../../../src/widgets/ActionBar';
import * as actionbarCss from '../../../src/styles/actionbar.m.css';
import * as actionbarbuttonCss from '../../../src/styles/actionbarbutton.m.css';

registerSuite('widgets/ActionBar', {
	tests: {
		'basic ActionBarButton rendering'() {
			const widget = harness(ActionBarButton);

			widget.expectRender(v('li', {
				classes: [ actionbarbuttonCss.root, actionbarbuttonCss.rootFixed ],
				role: 'presentation',
				onclick: widget.listener
			}, [
				v('a', {
					classes: [ actionbarbuttonCss.label, actionbarbuttonCss.labelFixed, null ],
					role: 'button',
					tabIndex: 0,
					title: undefined
				})
			]));

			widget.destroy();
		},

		'basic ActionBar rendering'() {
			const widget = harness(ActionBar);

			const expected = v('div', {
				classes: [ actionbarCss.root, actionbarCss.rootFixed ],
				key: 'root'
			} , [
				v('ul', {
					'aria-label': undefined,
					classes: [ actionbarCss.toolbar, actionbarCss.toolbarFixed ],
					role: 'toolbar'
				}, [ ])
			]);

			widget.expectRender(expected);

			widget.destroy();
		}
	}
});
