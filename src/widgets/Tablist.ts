import { find } from '@dojo/shim/array';
import { v, w } from '@dojo/widget-core/d';
import { WNode } from '@dojo/widget-core/interfaces';
import Dimensions, { DimensionResults } from '@dojo/widget-core/meta/Dimensions';
import { ThemedMixin, ThemedProperties, theme } from '@dojo/widget-core/mixins/Themed';
import WidgetBase from '@dojo/widget-core/WidgetBase';
import ActionBar, { ActionBarButton } from './ActionBar';
import ScrollBar from './ScrollBar';
import Hover from './meta/Hover';

import * as iconCss from '../styles/icons.m.css';
import * as tabCss from '../styles/tab.m.css';
import * as tablistCss from '../styles/tablist.m.css';
import * as tablistScrollbarCss from '../styles/tablistscrollbar.m.css';

const ThemeableBase = ThemedMixin(WidgetBase);

export interface TabProperties extends ThemedProperties {
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
		const { iconClass, key, label, labelDescription, selected, title } = this.properties;
		return v('div', {
			'aria-label': `${label}, tab`,
			classes: [ ...this.theme([ tabCss.root, selected ? tabCss.selected : null ]), tabCss.rootFixed ],
			key,
			role: 'tab',
			tabIndex: 0,
			title,

			onclick: this._onclick
		}, [
			v('div', {
				classes: [ this.theme(tabCss.label), tabCss.labelFixed, iconCss.label, iconClass || null ],
				title
			}, [
				v('a', {
					classes: tabCss.link
				}, [ label ]),
				v('span', {
					classes: [ this.theme(tabCss.description), tabCss.descriptionFixed ]
				}, [ labelDescription ])
			]),
			v('div', {
				classes: this.theme(tabCss.closer),
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
 * A scrollbar where the theme is tied to the Tablist
 */
@theme(tablistScrollbarCss)
export class TablistScrollBar extends ScrollBar {}

/**
 * A widget which contains tabs
 */
@theme(tablistCss)
export default class Tablist extends ThemeableBase<ThemedProperties, WNode<Tab>> {
	private _cachedSelectedKey: string | number | undefined;
	private _position = 0;

	private _getChildren() {
		return this.children.map((child) => {
			if (!child) {
				return child;
			}
			return v('div', {
				key: child.properties.key,
				classes: [ this.theme(tablistCss.tab), tablistCss.tabFixed ]
			}, [ child ]);
		});
	}

	private _getSelectedKey() {
		const { children } = this;
		const selectedChild = find(children, (child) => {
			return Boolean(child && child.properties.selected);
		});
		if (selectedChild && selectedChild.properties.key) {
			return selectedChild.properties.key;
		}
	}

	private _onScroll(delta: number) {
		this._position += delta;
		this.invalidate();
	}

	private _onwheel = (event: WheelEvent) => {
		const { deltaX: delta } = event;
		if (delta) {
			event.preventDefault();
			this._position += delta;
			this.invalidate();
		}
	}

	private _setPosition(dimensions: DimensionResults) {
		const selectedKey = this._getSelectedKey();
		if (selectedKey && selectedKey !== this._cachedSelectedKey) {
			const selectedDimensions = this.meta(Dimensions).get(selectedKey);
			if (selectedDimensions.size.width) {
				this._cachedSelectedKey = selectedKey;
			}
			else {
				return;
			}
			if (this._position > selectedDimensions.offset.left) {
				this._position = selectedDimensions.offset.left;
			}
			else if ((this._position + dimensions.size.width) < (selectedDimensions.offset.left + selectedDimensions.offset.width)) {
				this._position = selectedDimensions.offset.left + selectedDimensions.offset.width - dimensions.size.width;
			}
		}
		else {
			if (this._position < 0)  {
				this._position = 0;
			}
			else if ((this._position + dimensions.size.width) > dimensions.scroll.width) {
				this._position = dimensions.scroll.width - dimensions.size.width;
			}
		}
	}

	render () {
		const visible = this.meta(Hover).get('root');
		const tablistDimensions = this.meta(Dimensions).get('tablist');
		this._setPosition(tablistDimensions);

		const { _position, properties: { theme } } = this;

		return v('div', {
			classes: [ this.theme(tablistCss.root), tablistCss.rootFixed ],
			key: 'root',
			role: 'presentation'
		}, [
			v('div', {
				classes: [ this.theme(tablistCss.tablist), tablistCss.tablistFixed ],
				key: 'tablist',
				role: 'tablist',
				styles: {
					left: _position ? `-${_position}px` : '0'
				},

				onwheel: this._onwheel
			}, this._getChildren()),
			w(TablistScrollBar, {
				horizontal: true,
				position: _position,
				size: tablistDimensions.scroll.width,
				sliderSize: tablistDimensions.size.width,
				theme,
				visible,

				onScroll: this._onScroll
			})
		]);
	}
}
