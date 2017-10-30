const { registerSuite } = intern.getInterface('object');
import Hover from '../../../../src/widgets/meta/Hover';
import harness from '@dojo/test-extras/harness';
import WidgetBase from '@dojo/widget-core/WidgetBase';
import { v } from '@dojo/widget-core/d';

registerSuite('widgets/meta/Hover', {
	tests: {
		'basic functionality'() {
			class HoverWidget extends WidgetBase {
				render() {
					const hovering = this.meta(Hover).get('root');
					return v('div', { key: 'root', styles: { background: hovering ? 'black' : 'white' } });
				}
			}

			const widget = harness(HoverWidget);
			widget.expectRender(v('div', { key: 'root', styles: { background: 'white' } }));
			widget.expectRender(v('div', { key: 'root', styles: { background: 'white' } }));
			widget.sendEvent('mouseenter', { eventInit: { bubbles: true } });
			widget.expectRender(v('div', { key: 'root', styles: { background: 'black' } }));
			widget.sendEvent('mouseenter', { eventInit: { bubbles: true } });
			widget.sendEvent('mouseleave', { eventInit: { bubbles: true } });
			widget.expectRender(v('div', { key: 'root', styles: { background: 'white' } }));
			widget.sendEvent('mouseleave', { eventInit: { bubbles: true } });
			widget.destroy();
		}
	}
});
