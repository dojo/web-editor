import { v } from '@dojo/widget-core/d';
import { WNode } from '@dojo/widget-core/interfaces';
import { ThemedMixin, ThemedProperties, theme } from '@dojo/widget-core/mixins/Themed';
import WidgetBase from '@dojo/widget-core/WidgetBase';

import * as actionbarCss from '../styles/actionbar.m.css';
import * as actionbarbuttonCss from '../styles/actionbarbutton.m.css';

const ThemedBase = ThemedMixin(WidgetBase);

export interface ActionBarProperties extends ThemedProperties {
	/**
	 * The label used for a11y information
	 */
	label: string;
}

export interface ActionBarButtonProperties extends ThemedProperties {
	/**
	 * The class name to place on the icon node
	 */
	iconClass?: string;

	/**
	 * The label used fr a11y and when hinting on the button
	 */
	label: string;

	/**
	 * Called when the button is clicked
	 */
	onClick?(): void;
}

/**
 * A widget which provides a simple icon UI element that performs a single action
 */
@theme(actionbarbuttonCss)
export class ActionBarButton extends ThemedBase<ActionBarButtonProperties, null> {
	private _onclick() {
		const { onClick } = this.properties;
		onClick && onClick();
	}

	render() {
		const { iconClass, label: title } = this.properties;
		return v('li', {
			classes: [ this.theme(actionbarbuttonCss.root), actionbarbuttonCss.rootFixed ],
			role: 'presentation',
			onclick: this._onclick
		}, [
			v('a', {
				classes: [ this.theme(actionbarbuttonCss.label), actionbarbuttonCss.labelFixed, iconClass || null ],
				role: 'button',
				tabIndex: 0,
				title
			})
		]);
	}
}

/**
 * A widget which contains children `ActionBarButton`
 */
@theme(actionbarCss)
export default class ActionBar extends ThemedBase<ActionBarProperties, WNode<ActionBarButton>> {
	render() {
		return v('div', {
			classes: [ this.theme(actionbarCss.root), actionbarCss.rootFixed ],
			key: 'root'
		} , [
			v('ul', {
				'aria-label': this.properties.label,
				classes: [ this.theme(actionbarCss.toolbar), actionbarCss.toolbarFixed ],
				role: 'toolbar'
			}, this.children)
		]);
	}
}
