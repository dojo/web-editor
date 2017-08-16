import { v } from '@dojo/widget-core/d';
import { WidgetProperties } from '@dojo/widget-core/interfaces';
import WidgetBase from '@dojo/widget-core/WidgetBase';
import { IconJson, IconResolver } from './support/icons';

export interface IconCssProperties extends WidgetProperties {
	/**
	 * The base class which identifies nodes that should have an icon
	 */
	baseClass: string;

	/**
	 * An object structure which defines the different icons
	 */
	icons?: IconJson;

	/**
	 * The root path where the icons are located
	 */
	sourcePath?: string;
}

/**
 * A function that converts an `IconJson` structure into CSS text
 * @param sourcePath The base URL where the icons are located
 * @param baseClass The base class name which an icon is based off of
 * @param icons An object structure that defines icon classes
 */
function getStylesFromJson(sourcePath: string, baseClass: string, icons: IconJson): string {

	const resolver = new IconResolver(sourcePath, icons);
	let styles = '';

	function before(selector: string): string {
		return selector + '::before';
	}

	function toSelector(...classes: string[]): string {
		return '.' + classes.join('.');
	}

	function iconStyle(selector: string, iconUrl: string): string {
		return `${before(selector)} { content: ' '; background-image: url('${iconUrl}'); }\n`;
	}

	for (const key in icons.iconDefinitions) {
		styles += iconStyle(toSelector(baseClass, key), resolver.iconUrl(key));
	}

	return styles;
}

export default class IconCss extends WidgetBase<IconCssProperties> {
	render() {
		return v('style', {
			media: 'screen',
			type: 'text/css'
		}, [
			this.properties.icons && this.properties.sourcePath && getStylesFromJson(this.properties.sourcePath, this.properties.baseClass, this.properties.icons) || null
		]);
	}
}
