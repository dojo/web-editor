const { beforeEach, describe, it } = intern.getInterface('bdd');
const { assert } = intern.getPlugin('chai');
import { compareProperty } from '@dojo/test-extras/support/d';
import harness from '@dojo/test-extras/harness';
import { v, w } from '@dojo/widget-core/d';

import LiveCodeController, { editorMap } from '../../src/LiveCodeController';
import LiveCodeExample from '../../src/LiveCodeExample';
import WidgetBase from '@dojo/widget-core/WidgetBase';
import project, { reset, projectFilesMap } from '../support/projectStub';

class TestWidget extends WidgetBase {
	protected render() {
		return v('div');
	}
}

function pause(timeout: number = 10): Promise<void> {
	return new Promise((resolve) => {
		setTimeout(() => {
			resolve();
		}, timeout);
	});
}

const compareModel = compareProperty((value: any) => {
	return value && typeof value === 'object';
});

const compareProgram = compareProperty((value: any) => {
	return value && typeof value === 'object';
});

describe('LiveCodeController', () => {
	beforeEach(() => {
		editorMap.clear();
		reset();
	});

	it('should render with empty children array', () => {
		const widget = harness(LiveCodeController);
		widget.setProperties({
			project
		});
		widget.setChildren([]);
		widget.expectRender([]);
		widget.destroy();
	});

	it('should render non LiveCodeExample children', () => {
		const widget = harness(LiveCodeController);
		widget.setProperties({
			project
		});
		widget.setChildren([
			v('div'),
			w(TestWidget, {})
		]);
		widget.expectRender([
			v('div'),
			w(TestWidget, {})
		]);
		widget.destroy();
	});

	it('should mixin proprties to LiveCodeExample children', () => {
		const widget = harness(LiveCodeController);
		widget.setProperties({
			project
		});
		widget.setChildren([
			w(LiveCodeExample, {
				description: 'foo bar baz',
				id: 'foobarbaz',
				title: 'Foo Bar Baz'
			})
		]);
		widget.expectRender([
			w(LiveCodeExample, {
				changeInterval: 2000,
				description: 'foo bar baz',
				id: 'foobarbaz',
				model: undefined,
				program: undefined,
				runnerSrc: undefined,
				title: 'Foo Bar Baz',
				onDirty: widget.listener
			})
		]);
		widget.destroy();
	});

	it('should pass through the change interval to LiveCodeExample children', () => {
		const widget = harness(LiveCodeController);
		widget.setProperties({
			changeInterval: 1500,
			project
		});
		widget.setChildren([
			w(LiveCodeExample, {
				description: 'foo bar baz',
				id: 'foobarbaz',
				title: 'Foo Bar Baz'
			})
		]);
		widget.expectRender([
			w(LiveCodeExample, {
				changeInterval: 1500,
				description: 'foo bar baz',
				id: 'foobarbaz',
				model: undefined,
				program: undefined,
				runnerSrc: undefined,
				title: 'Foo Bar Baz',
				onDirty: widget.listener
			})
		]);
		widget.destroy();
	});

	it('should pass through the runner source to LiveCodeExample children', () => {
		const widget = harness(LiveCodeController);
		widget.setProperties({
			project,
			runnerSrc: './foobar.html'
		});
		widget.setChildren([
			w(LiveCodeExample, {
				description: 'foo bar baz',
				id: 'foobarbaz',
				title: 'Foo Bar Baz'
			})
		]);
		widget.expectRender([
			w(LiveCodeExample, {
				changeInterval: 2000,
				description: 'foo bar baz',
				id: 'foobarbaz',
				model: undefined,
				program: undefined,
				runnerSrc: './foobar.html',
				title: 'Foo Bar Baz',
				onDirty: widget.listener
			})
		]);
		widget.destroy();
	});

	it('should create a project file with appropriate text from LiveCodeExample', async () => {
		const widget = harness(LiveCodeController);
		widget.setProperties({ project });
		widget.setChildren([
			w(LiveCodeExample, {
				description: 'foo bar baz',
				id: 'foobarbaz',
				title: 'Foo Bar Baz'
			}, [
				`console.log('Hello World!);`
			])
		]);
		widget.expectRender([
			w(LiveCodeExample, {
				changeInterval: 2000,
				description: 'foo bar baz',
				id: 'foobarbaz',
				model: undefined,
				program: undefined,
				runnerSrc: undefined,
				title: 'Foo Bar Baz',
				onDirty: widget.listener
			}, [
				`console.log('Hello World!);`
			])
		]);
		assert.isTrue(projectFilesMap.has('./src/foobarbaz.ts'), 'should have added expected file');
		assert.strictEqual(projectFilesMap.size, 1, 'should only create one file');
		widget.setChildren([
			w(LiveCodeExample, {
				description: 'foo bar baz',
				id: 'foobarbaz',
				title: 'Foo Bar Baz'
			}, [
				`console.log('Hello World!);`
			])
		]);
		// because the program compilation resolves out of turn, and there is no way to make it sync
		// we have to inject a pause into tests to get the render to properly work
		await pause();
		widget.expectRender([
			w(LiveCodeExample, {
				changeInterval: 2000,
				description: 'foo bar baz',
				id: 'foobarbaz',
				model: compareModel as any,
				program: compareProgram as any,
				runnerSrc: undefined,
				title: 'Foo Bar Baz',
				onDirty: widget.listener
			}, [
				`console.log('Hello World!);`
			])
		]);
		widget.destroy();
	});

	it('should create a project file with appropriate text and extension from LiveCodeExample when using TSX', async () => {
		const widget = harness(LiveCodeController);
		widget.setProperties({ project });
		widget.setChildren([
			w(LiveCodeExample, {
				description: 'foo bar baz',
				id: 'foobarbaz',
				title: 'Foo Bar Baz',
				tsx: true
			}, [
				`console.log('Hello World!);`
			])
		]);
		widget.expectRender([
			w(LiveCodeExample, {
				changeInterval: 2000,
				description: 'foo bar baz',
				id: 'foobarbaz',
				model: undefined,
				program: undefined,
				runnerSrc: undefined,
				title: 'Foo Bar Baz',
				tsx: true,
				onDirty: widget.listener
			}, [
				`console.log('Hello World!);`
			])
		]);
		assert.isTrue(projectFilesMap.has('./src/foobarbaz.tsx'));
		widget.setChildren([
			w(LiveCodeExample, {
				description: 'foo bar baz',
				id: 'foobarbaz',
				title: 'Foo Bar Baz',
				tsx: true
			}, [
				`console.log('Hello World!);`
			])
		]);
		await pause();
		widget.expectRender([
			w(LiveCodeExample, {
				changeInterval: 2000,
				description: 'foo bar baz',
				id: 'foobarbaz',
				model: compareModel as any,
				program: compareProgram as any,
				runnerSrc: undefined,
				title: 'Foo Bar Baz',
				tsx: true,
				onDirty: widget.listener
			}, [
				`console.log('Hello World!);`
			])
		]);
		widget.destroy();
	});

	it('should only set program on dirty children', async () => {
		const widget = harness(LiveCodeController);
		widget.setProperties({ project });
		widget.setChildren([
			w(LiveCodeExample, {
				description: 'foo bar baz',
				id: 'foobarbaz',
				key: '1',
				title: 'Foo Bar Baz'
			}, [
				`console.log('Hello World!');`
			]),
			w(LiveCodeExample, {
				description: 'qat qux',
				id: 'qatqux',
				key: '2',
				title: 'Quack Quack'
			}, [
				`console.log('quack quack');`
			])
		]);
		widget.expectRender([
			w(LiveCodeExample, {
				changeInterval: 2000,
				description: 'foo bar baz',
				id: 'foobarbaz',
				key: '1',
				model: undefined,
				program: undefined,
				runnerSrc: undefined,
				title: 'Foo Bar Baz',
				onDirty: widget.listener
			}, [
				`console.log('Hello World!');`
			]),
			w(LiveCodeExample, {
				changeInterval: 2000,
				description: 'qat qux',
				id: 'qatqux',
				key: '2',
				model: undefined,
				program: undefined,
				runnerSrc: undefined,
				title: 'Quack Quack',
				onDirty: widget.listener
			}, [
				`console.log('quack quack');`
			])
		]);
		assert.isTrue(projectFilesMap.has('./src/foobarbaz.ts'), 'should have added expected file');
		assert.isTrue(projectFilesMap.has('./src/qatqux.ts'), 'should have added expected file');
		assert.strictEqual(projectFilesMap.size, 2, 'should only created two files');
		widget.setChildren([
			w(LiveCodeExample, {
				description: 'foo bar baz',
				id: 'foobarbaz',
				key: '1',
				title: 'Foo Bar Baz'
			}, [
				`console.log('Hello World!');`
			]),
			w(LiveCodeExample, {
				description: 'qat qux',
				id: 'qatqux',
				key: '2',
				title: 'Quack Quack'
			}, [
				`console.log('quack quack');`
			])
		]);
		await pause();
		widget.expectRender([
			w(LiveCodeExample, {
				changeInterval: 2000,
				description: 'foo bar baz',
				id: 'foobarbaz',
				key: '1',
				model: compareModel as any,
				program: compareProgram as any,
				runnerSrc: undefined,
				title: 'Foo Bar Baz',
				onDirty: widget.listener
			}, [
				`console.log('Hello World!');`
			]),
			w(LiveCodeExample, {
				changeInterval: 2000,
				description: 'qat qux',
				id: 'qatqux',
				key: '2',
				model: compareModel as any,
				program: compareProgram as any,
				runnerSrc: undefined,
				title: 'Quack Quack',
				onDirty: widget.listener
			}, [
				`console.log('quack quack');`
			])
		]);
		// TODO: https://github.com/dojo/test-extras/issues/88
		const render: any[] = widget.getRender() as any;
		// TODO: https://github.com/dojo/test-extras/issues/87
		render[0].properties.onDirty('foobarbaz');
		widget.setChildren([
			w(LiveCodeExample, {
				description: 'foo bar baz',
				id: 'foobarbaz',
				key: '1',
				title: 'Foo Bar Baz'
			}, [
				`console.log('Hello World!');`
			]),
			w(LiveCodeExample, {
				description: 'qat qux',
				id: 'qatqux',
				key: '2',
				title: 'Quack Quack'
			}, [
				`console.log('quack quack');`
			])
		]);
		await pause();
		widget.expectRender([
			w(LiveCodeExample, {
				changeInterval: 2000,
				description: 'foo bar baz',
				id: 'foobarbaz',
				key: '1',
				model: compareModel as any,
				program: compareProgram as any,
				runnerSrc: undefined,
				title: 'Foo Bar Baz',
				onDirty: widget.listener
			}, [
				`console.log('Hello World!');`
			]),
			w(LiveCodeExample, {
				changeInterval: 2000,
				description: 'qat qux',
				id: 'qatqux',
				key: '2',
				model: compareModel as any,
				program: undefined,
				runnerSrc: undefined,
				title: 'Quack Quack',
				onDirty: widget.listener
			}, [
				`console.log('quack quack');`
			])
		]);
		widget.destroy();
	});
});
