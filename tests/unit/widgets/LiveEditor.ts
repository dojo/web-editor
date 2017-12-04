const { describe, it } = intern.getInterface('bdd');
import harness from '@dojo/test-extras/harness';
import { v, w } from '@dojo/widget-core/d';

import LiveEditor from '../../../src/widgets/LiveEditor';
import * as css from '../../../src/styles/liveeditor.m.css';
import Editor from '../../../src/widgets/Editor';
import Runner from '../../../src/widgets/Runner';

describe('widgets/LiveEditor', () => {
	it('should render just with an "id" property', () => {
		const widget = harness(LiveEditor);
		widget.setProperties({
			id: 'foobar'
		});
		widget.expectRender(v('div', {
			classes: [ css.root, css.rootFixed ]
		}, [
			v('div', {
				classes: css.left,
				key: 'left'
			}, [
				v('div', {}, [ 'Live Editor' ]),
				w(Editor, {
					changeInterval: 1000,
					key: 'editor',
					model: undefined,
					options: {
						lineNumbers: 'off',
						minimap: { enabled: false }
					},
					onDirty: undefined
				})
			]),
			v('div', {
				classes: css.right,
				key: 'right'
			}, [
				v('div', {}, [ 'Result' ]),
				w(Runner, {
					key: 'runner',
					main: 'src/foobar',
					src: undefined
				})
			])
		]));
	});

	it('should render with all properties supplied', () => {
		const widget = harness(LiveEditor);
		widget.setProperties({
			changeInterval: 100,
			id: 'foobar',
			model: {} as any,
			program: {
				css: [],
				dependencies: {},
				html: '',
				modules: {}
			},
			runnerSrc: 'foobar.html',
			onDirty() { }
		});
		widget.expectRender(v('div', {
			classes: [ css.root, css.rootFixed ]
		}, [
			v('div', {
				classes: css.left,
				key: 'left'
			}, [
				v('div', {}, [ 'Live Editor' ]),
				w(Editor, {
					changeInterval: 100,
					key: 'editor',
					model: {} as any,
					options: {
						lineNumbers: 'off',
						minimap: { enabled: false }
					},
					onDirty: widget.listener
				})
			]),
			v('div', {
				classes: css.right,
				key: 'right'
			}, [
				v('div', {}, [ 'Result' ]),
				w(Runner, {
					key: 'runner',
					main: 'src/foobar',
					src: 'foobar.html',
					css: [],
					dependencies: {},
					html: '',
					modules: {}
				})
			])
		]));
	});
});
