import * as registerSuite from 'intern!object';
import harness from '@dojo/test-extras/harness';
import { v, w } from '@dojo/widget-core/d';
import Toolbar from '../../../src/widgets/Toolbar';
import * as toolbarCss from '../../../src/styles/toolbar.m.css';
import ActionBar, { ActionBarButton } from '../../../src/widgets/ActionBar';
import Tablist from '../../../src/widgets/Tablist';

registerSuite({
	name: 'widgets/Toolbar',

	'basic rendering'() {
		const widget = harness(Toolbar);

		const expected = v('div', {
			classes: widget.classes(toolbarCss.root, toolbarCss.rootFixed),
			key: 'root'
		}, [
			w(ActionBar, {
				key: 'fileActions',
				label: 'File actions',
				theme: undefined
			}, [
				w(ActionBarButton, {
					label: 'Toggle files',
					iconClass: toolbarCss.filesIconClosed,
					theme: undefined,
					onClick: widget.listener
				})
			]),
			w(Tablist, {
				theme: undefined
			}, []),
			w(ActionBar, {
				key: 'runnerActions',
				label: 'Runner actions',
				theme: undefined
			}, [
				w(ActionBarButton, {
					key: 'runProject',
					label: 'Run project',
					iconClass: toolbarCss.runIconDisabled,
					theme: undefined,
					onClick: widget.listener
				}),
				w(ActionBarButton, {
					key: 'toggleRunner',
					label: 'Toggle runner',
					iconClass: toolbarCss.previewIconClosed,
					theme: undefined,
					onClick: widget.listener
				})
			])
		]);

		widget.expectRender(expected);

		widget.destroy();
	}
});
