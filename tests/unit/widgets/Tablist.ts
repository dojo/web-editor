import * as registerSuite from 'intern!object';
import harness from '@dojo/test-extras/harness';
import { v, w } from '@dojo/widget-core/d';
import Tablist, { Tab, TablistScrollBar } from '../../../src/widgets/Tablist';
import * as iconCss from '../../../src/styles/icons.m.css';
import * as tabCss from '../../../src/styles/tab.m.css';
import * as tablistCss from '../../../src/styles/tablist.m.css';
import ActionBar, { ActionBarButton } from '../../../src/widgets/ActionBar';

registerSuite({
	name: 'widgets/Tablist',

	'basic tab rendering'() {
		const widget = harness(Tab);
		widget.setProperties({
			label: 'foo',
			labelDescription: 'labelDescription'
		});

		const expected = v('div', {
			'aria-label': `foo, tab`,
			classes: widget.classes(tabCss.root, null, tabCss.rootFixed),
			key: undefined,
			role: 'tab',
			tabIndex: 0,
			title: undefined,

			onclick: widget.listener
		}, [
			v('div', {
				classes: widget.classes(tabCss.label, tabCss.labelFixed, iconCss.label, null),
				title: undefined
			}, [
				v('a', {
					classes: widget.classes(tabCss.link)
				}, [ 'foo' ]),
				v('span', {
					classes: widget.classes(tabCss.description, tabCss.descriptionFixed)
				}, [ 'labelDescription' ])
			]),
			v('div', {
				classes: widget.classes(tabCss.closer),
				key: 'closer'
			}, [
				w(ActionBar, {
					label: 'Tab actions'
				}, [
					w(ActionBarButton, {
						iconClass: tabCss.closeIcon,
						label: `Close foo`,
						onClick: widget.listener
					})
				])
			])
		]);

		widget.expectRender(expected);

		widget.destroy();
	},

	'basic tablist rendering'() {
		const widget = harness(Tablist);

		const expected = v('div', {
			classes: widget.classes(tablistCss.root, tablistCss.rootFixed),
			key: 'root',
			role: 'presentation'
		}, [
			v('div', {
				classes: widget.classes(tablistCss.tablist, tablistCss.tablistFixed),
				key: 'tablist',
				role: 'tablist',
				styles: {
					left: '0'
				},

				onwheel: widget.listener
			}, [ ]),
			w(TablistScrollBar, {
				horizontal: true,
				position: 0,
				size: 0,
				sliderSize: 0,
				theme: undefined,
				visible: false,

				onScroll: widget.listener
			})
		]);

		widget.expectRender(expected);

		widget.destroy();
	}
});
