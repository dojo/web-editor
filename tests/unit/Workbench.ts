import * as registerSuite from 'intern!object';
import * as assert from 'intern/chai!assert';
import harness, { Harness } from '@dojo/test-extras/harness';
import { WNode } from '@dojo/widget-core/interfaces';
import WidgetBase from '@dojo/widget-core/WidgetBase';
import * as css from '../../src/styles/workbench.m.css';
import { EditorProperties } from '../../src/Editor';
import UnitUnderTest, { WorkbenchProperties } from '../../src/Workbench';

import { Handle } from '@dojo/interfaces/core';
import loadModule from '../support/loadModule';
import { enable, register } from '../support/mock';

let widget: Harness<WorkbenchProperties, typeof UnitUnderTest>;
let mockHandle: Handle;
/* tslint:disable:variable-name */
let Workbench: typeof UnitUnderTest;

class Editor extends WidgetBase<EditorProperties> {}

registerSuite({
	name: 'Workbench',

	async setup() {
		register('src/Editor', {
			default: Editor
		});
		mockHandle = enable();
		Workbench = (await loadModule('../../src/Workbench', require)).default;
	},

	teardown() {
		mockHandle.destroy();
	},

	beforeEach() {
		widget = harness(Workbench);
	},

	'basic rendering'() {
		const onRun = () => {};
		widget.setProperties({
			filename: 'foobar',
			onRun
		});

		widget.classes(css.left)();

		const render = widget.getRender() as WNode<UnitUnderTest>;
		assert.lengthOf(render.children, 4, 'Should have four children');
		assert.deepEqual((render.properties as any).classes, widget.classes(css.root)(), 'Has correct classes');
	}
});
