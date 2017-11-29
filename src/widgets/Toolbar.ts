import { v, w } from '@dojo/widget-core/d';
import { WNode } from '@dojo/widget-core/interfaces';
import { ThemedMixin, ThemedProperties, theme } from '@dojo/widget-core/mixins/Themed';
import WidgetBase from '@dojo/widget-core/WidgetBase';
import ActionBar, { ActionBarButton } from './ActionBar';
import Tablist, { Tab } from './Tablist';

import * as toolbarCss from '../styles/toolbar.m.css';

const ThemedBase = ThemedMixin(WidgetBase);

export interface ToolbarProperties extends ThemedProperties {
	/**
	 * Determines if the files action button is displaying in an open or closed state
	 */
	filesOpen?: boolean;

	/**
	 * Determines if the run action button is displaying in a runnable state or not
	 */
	runnable?: boolean;

	/**
	 * Determines if the runner action button is displaying in an open or closed state
	 */
	runnerOpen?: boolean;

	/**
	 * Called when the Run action button is clicked
	 */
	onRunClick?(): void;

	/**
	 * Called when the Files action button is clicked
	 */
	onToggleFiles?(): void;

	/**
	 * Called when the Runner action button is clicked
	 */
	onToggleRunner?(): void;
}

/**
 * A widget which provides a tab list of tabs based on open files and three actions buttons to control the workbench UI
 * What tabs are displayed are the widget's children.
 */
@theme(toolbarCss)
export default class Toolbar extends ThemedBase<ToolbarProperties, WNode<Tab>> {
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
			classes: [ this.theme(toolbarCss.root), toolbarCss.rootFixed ],
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
