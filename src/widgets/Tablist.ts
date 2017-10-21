import { v, w } from '@dojo/widget-core/d';
import { WNode } from '@dojo/widget-core/interfaces';
import { ThemeableMixin, ThemeableProperties, theme } from '@dojo/widget-core/mixins/Themeable';
import WidgetBase from '@dojo/widget-core/WidgetBase';
import ActionBar, { ActionBarButton } from './ActionBar';

import * as iconCss from '../styles/icons.m.css';
import * as tabCss from '../styles/tab.m.css';
import * as tablistCss from '../styles/tablist.m.css';

const ThemeableBase = ThemeableMixin(WidgetBase);

export interface TabProperties extends ThemeableProperties {
	/**
	 * The icon class to set on the tab
	 */
	iconClass?: string;

	/**
	 * The label for the tab
	 */
	label: string;

	/**
	 * An extended description for the label which appears alongside the label
	 */
	labelDescription?: string;

	/**
	 * Determines if the tab displays in a selected state or not
	 */
	selected?: boolean;

	/**
	 * The title of the tab, which is for a11y and when hinting on the tab
	 */
	title?: string;

	/**
	 * Called when a tab is attempted to be closed
	 * @param key The key of the tab
	 * @param label The label of the tab
	 */
	onClose?(key: string | number | undefined, label: string): void;

	/**
	 * Called when a tab is attempted to be selected
	 * @param key The key of the tab
	 * @param label The label of the tab
	 */
	onSelect?(key: string | number | undefined, label: string): void;
}

/**
 * A widget which provides a tab representation of its properties
 */
@theme(tabCss)
export class Tab extends ThemeableBase<TabProperties, null> {
	private _onclick() {
		const { key, label, onSelect, selected } = this.properties;
		if (!selected && onSelect) {
			onSelect(key, label);
		}
	}

	private _onActionBarButtonClick = () => {
		const { key, label, onClose } = this.properties;
		onClose && onClose(key, label);
	}

	render() {
		const { iconClass, label, labelDescription, selected, title } = this.properties;
		return v('div', {
			'aria-label': `${label}, tab`,
			classes: this.classes(tabCss.root, selected ? tabCss.selected : null).fixed(tabCss.rootFixed),
			role: 'presentation',
			tabIndex: 0,
			title,

			onclick: this._onclick
		}, [
			v('div', {
				classes: this.classes(tabCss.label).fixed(tabCss.labelFixed, iconCss.label, iconClass || null),
				title
			}, [
				v('a', {
					classes: this.classes().fixed(tabCss.link)
				}, [ label ]),
				v('span', {
					classes: this.classes(tabCss.description).fixed(tabCss.descriptionFixed)
				}, [ labelDescription ])
			]),
			v('div', {
				classes: this.classes(tabCss.closer),
				key: 'closer'
			}, [
				w(ActionBar, {
					label: 'Tab actions'
				}, [
					w(ActionBarButton, {
						iconClass: tabCss.closeIcon,
						label: `Close ${label}`,
						onClick: this._onActionBarButtonClick
					})
				])
			])
		]);
	}
}

/**
 * A widget which contains tabs
 */
@theme(tablistCss)
export default class Tablist extends ThemeableBase<ThemeableProperties, WNode<Tab>> {
	render () {
		return v('div', {
			classes: this.classes(tablistCss.root).fixed(tablistCss.rootFixed),
			key: 'root',
			role: 'presentation'
		}, [
			v('div', {
				classes: this.classes(tablistCss.tablist).fixed(tablistCss.tablistFixed),
				key: 'tablist',
				role: 'tablist'
			}, this.children)
		]);
	}
}
