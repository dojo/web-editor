import { v, w } from '@dojo/widget-core/d';
import { WNode } from '@dojo/widget-core/interfaces';
import { ThemeableMixin, ThemeableProperties, theme } from '@dojo/widget-core/mixins/Themeable';
import WidgetBase from '@dojo/widget-core/WidgetBase';

import * as actionbarCss from './styles/actionbar.m.css';
import * as actionbarbuttonCss from './styles/actionbarbutton.m.css';
import * as iconCss from './styles/icons.m.css';
import * as tabCss from './styles/tab.m.css';
import * as tablistCss from './styles/tablist.m.css';
import * as toolbarCss from './styles/toolbar.m.css';

const ThemeableBase = ThemeableMixin(WidgetBase);

export interface ActionBarProperties extends ThemeableProperties {
	label: string;
}

export interface ActionBarButtonProperties extends ThemeableProperties {
	iconClass?: string;
	label: string;

	onClick?(): void;
}

export interface TabProperties extends ThemeableProperties {
	iconClass?: string;
	label: string;
	labelDescription?: string;
	selected?: boolean;
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

export interface TablistProperties extends ThemeableProperties { }

export interface ToolbarProperties extends ThemeableProperties {
	filesOpen?: boolean;
	runnable?: boolean;
	runnerOpen?: boolean;

	onRunClick?(): void;
	onToggleFiles?(): void;
	onToggleRunner?(): void;
}

@theme(actionbarCss)
export class ActionBar extends ThemeableBase<ActionBarProperties, WNode<ActionBarButton>> {
	render() {
		return v('div', {
			classes: this.classes(actionbarCss.root).fixed(actionbarCss.rootFixed),
			key: 'root'
		} , [
			v('ul', {
				'aria-label': this.properties.label,
				classes: this.classes(actionbarCss.toolbar).fixed(actionbarCss.toolbarFixed),
				role: 'toolbar'
			}, this.children)
		]);
	}
}

@theme(actionbarbuttonCss)
export class ActionBarButton extends ThemeableBase<ActionBarButtonProperties, null> {
	private _onClick() {
		const { onClick } = this.properties;
		onClick && onClick();
	}

	render() {
		const { iconClass, label: title } = this.properties;
		return v('li', {
			classes: this.classes(actionbarbuttonCss.root).fixed(actionbarbuttonCss.rootFixed),
			role: 'presentation',
			onclick: this._onClick
		}, [
			v('a', {
				classes: this.classes(actionbarbuttonCss.label).fixed(actionbarbuttonCss.labelFixed, iconClass || null),
				role: 'button',
				tabIndex: 0,
				title
			})
		]);
	}
}

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

@theme(tablistCss)
export class Tablist extends ThemeableBase<TablistProperties, WNode<Tab>> {
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

@theme(toolbarCss)
export default class Toolbar extends ThemeableBase<ToolbarProperties, WNode<Tab>> {
	private _onFilesClick = () => {
		const { onToggleFiles } = this.properties;
		onToggleFiles && onToggleFiles();
	}

	private _onRunClick = () => {
		const { onRunClick } = this.properties;
		onRunClick && onRunClick();
	}

	private _onRunnerClick = () => {
		const { onToggleRunner } = this.properties;
		onToggleRunner && onToggleRunner();
	}

	render() {
		const { filesOpen, runnable, runnerOpen, theme } = this.properties;
		return v('div', {
			classes: this.classes(toolbarCss.root).fixed(toolbarCss.rootFixed),
			key: 'root'
		}, [
			w(ActionBar, {
				key: 'fileActions',
				label: 'File actions',
				theme
			}, [
				w(ActionBarButton, {
					label: 'Toggle files',
					iconClass: filesOpen ? toolbarCss.filesIconOpen : toolbarCss.filesIconClosed,
					theme,
					onClick: this._onFilesClick
				})
			]),
			w(Tablist, {
				theme
			}, this.children),
			w(ActionBar, {
				key: 'runnerActions',
				label: 'Runner actions',
				theme
			}, [
				w(ActionBarButton, {
					key: 'runProject',
					label: 'Run project',
					iconClass: runnable ? toolbarCss.runIconEnabled : toolbarCss.runIconDisabled,
					theme,
					onClick: this._onRunClick
				}),
				w(ActionBarButton, {
					key: 'toggleRunner',
					label: 'Toggle runner',
					iconClass: runnerOpen ? toolbarCss.previewIconOpen : toolbarCss.previewIconClosed,
					theme,
					onClick: this._onRunnerClick
				})
			])
		]);
	}
}
