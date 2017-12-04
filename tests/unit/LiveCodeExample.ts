const { describe, it } = intern.getInterface('bdd');
import harness from '@dojo/test-extras/harness';
import { v, w } from '@dojo/widget-core/d';

import LiveCodeExample from '../../src/LiveCodeExample';
import * as css from '../../src/styles/livecodeexample.m.css';

import LiveEditor from '../../src/widgets/LiveEditor';

describe('LiveCodeExample', () => {
	it('should render properly', () => {
		const widget = harness(LiveCodeExample);
		widget.setProperties({
			description: 'foo bar baz',
			id: 'foobarbaz',
			title: 'Foo Bar Baz'
		});
		widget.expectRender(v('div', {
			classes: [ css.root, css.rootFixed ],
			id: 'foobarbaz',
			key: 'root'
		}, [
			v('div', {
				classes: css.left,
				key: 'left'
			}, [
				v('h1', {}, [ 'Foo Bar Baz' ]),
				v('div', {
					classes: css.description
				}, [
					v('p', {}, [ 'foo bar baz' ])
				])
			]),
			v('div', {
				classes: css.right,
				key: 'right'
			}, [
				w(LiveEditor, {
					changeInterval: 1000,
					id: 'foobarbaz',
					model: undefined,
					program: undefined,
					runnerSrc: undefined,
					onDirty: widget.listener
				})
			])
		]));
	});
});
