const { registerSuite } = intern.getInterface('object');
import harness, { Harness } from '@dojo/test-extras/harness';
import { v, w } from '@dojo/widget-core/d';
import Console, { ConsoleRow, ConsoleMessage, ConsoleMessageType } from '../../../src/widgets/Console';
import ActionBar, { ActionBarButton } from '../../../src/widgets/ActionBar';
import * as css from '../../../src/styles/console.m.css';
import { sandbox as sinonSandbox, SinonSandbox } from 'sinon';

let sandbox: SinonSandbox;
let widget: Harness<Console>;

registerSuite('Console', {
	before() {
		sandbox = sinonSandbox.create();
	},
	beforeEach() {
		widget = harness(Console);
	},
	afterEach() {
		sandbox.reset();
	},
	after() {
		sandbox.restore();
	},
	tests: {
		'basic rendering'() {
			const expected = v('div', {
				classes: css.root
			}, [
				w(ActionBar, {
					key: 'consoleActions',
					label: 'Console Actions',
					theme: undefined
				}, [
					w(ActionBarButton, {
						key: 'clearConsole',
						label: 'Clear Console',
						iconClass: css.clearConsoleIcon,
						onClick: widget.listener
					})
				]),
				v('div', {
					key: 'messageContainer',
					classes: css.messageContainer
				}, [])
			]);

			widget.expectRender(expected);
		},
		'basic rendering with content'() {
			const message: ConsoleMessage = {
				type: ConsoleMessageType.Log,
				message: 'Hello, World'
			};

			widget.setProperties({
				messages: [ message ]
			});

			const expected = v('div', {
				classes: css.root
			}, [
				w(ActionBar, {
					key: 'consoleActions',
					label: 'Console Actions',
					theme: undefined
				}, [
					w(ActionBarButton, {
						key: 'clearConsole',
						label: 'Clear Console',
						iconClass: css.clearConsoleIcon,
						onClick: widget.listener
					})
				]),
				v('div', {
					key: 'messageContainer',
					classes: css.messageContainer
				}, [
					w(ConsoleRow, {
						theme: undefined,
						message,
						key: 'message-0'
					})
				])
			]);

			widget.expectRender(expected);
		}
	}
});
