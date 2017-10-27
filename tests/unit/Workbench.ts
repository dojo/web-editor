import * as registerSuite from 'intern!object';
import harness from '@dojo/test-extras/harness';
import { v, w } from '@dojo/widget-core/d';
import Workbench from '../../src/Workbench';
import * as workbenchCss from '../../src/styles/workbench.m.css';
import * as iconCss from '../../src/styles/icons.m.css';
import IconCss from '../../src/widgets/IconCss';
import TreePane from '../../src/widgets/TreePane';
import Toolbar from '../../src/widgets/Toolbar';
import Editor from '../../src/widgets/Editor';
import Runner from '../../src/widgets/Runner';

registerSuite({
	name: 'Workbench',

	'basic rendering'() {
		const widget = harness(Workbench);

		const expected = v('div', {
			classes: widget.classes(workbenchCss.root, workbenchCss.rootFixed)
		}, [
			w(IconCss, {
				baseClass: iconCss.label,
				icons: undefined,
				key: 'icons',
				sourcePath: undefined
			}),
			v('div', {
				classes: widget.classes(workbenchCss.left, null),
				key: 'left'
			}, [
				w(TreePane, {
					expanded: [ './', './src' ],
					getItemClass: () => undefined,
					key: 'treepane',
					root: undefined,
					selected: '',
					theme: undefined,

					onItemOpen: widget.listener,
					onItemSelect: widget.listener,
					onItemToggle: widget.listener
				})
			]),
			v('div', {
				classes: widget.classes(workbenchCss.middle),
				key: 'middle'
			}, [
				w(Toolbar, {
					runnable: undefined,
					runnerOpen: true,
					filesOpen: true,
					theme: undefined,
					onRunClick: undefined,
					onToggleFiles: widget.listener,
					onToggleRunner: widget.listener
				}, [ ]),
				w(Editor, {
					key: 'editor',
					layout: false,
					model: undefined,
					options: {
						folding: true,
						minimap: { enabled: false },
						renderWhitespace: 'boundary'
					},
					theme: undefined,
					onDirty: undefined
				})
			]),
			v('div', {
				classes: widget.classes(workbenchCss.right, null),
				key: 'right'
			}, [
				w(Runner, {
					key: 'runner',
					theme: undefined,
					onRun: widget.listener
				})
			])
		]);

		widget.expectRender(expected);

		widget.destroy();
	}
});
