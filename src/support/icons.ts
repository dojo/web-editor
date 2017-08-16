import global from '@dojo/core/global';
import request from '@dojo/core/request';

const globalURL: typeof URL = global.window.URL;

/**
 * An object that corresponds to the JSON structure of the icon theme file
 */
export interface IconJson {
	iconDefinitions: {
		[name: string]: {
			iconPath: string;
		}
	};
	folderExpanded: string;
	folder: string;
	file: string;
	folderNames: {
		[name: string]: string;
	};
	folderNamesExpanded: {
		[name: string]: string;
	};
	fileExtensions: {
		[name: string]: string;
	};
	fileNames: {
		[name: string]: string;
	};
	languageIds: {
		[name: string]: string;
	};
}

export class IconResolver {
	private _config: IconJson;
	private _sourcePath: string;

	constructor(sourcePath: string, config: IconJson) {
		this._config = config;
		this._sourcePath = (new globalURL(sourcePath, window.location.toString()).toString());
	}

	/**
	 * Get the class name for an icon based on the folder name and if it is expanded or not
	 * @param name The name of the folder
	 * @param expanded If the expanded version of the icon should be used.  Defaults to `false`.
	 */
	folder(name: string, expanded: boolean = false): string {
		if (!expanded && name in this._config.folderNames) {
			return this._config.folderNames[name];
		}
		if (expanded && name in this._config.folderNamesExpanded) {
			return this._config.folderNamesExpanded[name];
		}
		return expanded ? this._config.folderExpanded : this._config.folder;
	}

	/**
	 * Get the class name for an icon based on the filename and optionally language.
	 * @param name The name of the file
	 * @param language An optional language which would override the extension.
	 */
	file(name: string, language: string = ''): string {
		if (name in this._config.fileNames) {
			return this._config.fileNames[name];
		}
		if (language && language in this._config.languageIds) {
			return this._config.languageIds[language];
		}
		const extensions = name.split('.');
		extensions.shift();
		while (extensions.length) {
			const current = extensions.join('.');
			if (current in this._config.fileExtensions) {
				return this._config.fileExtensions[current];
			}
			extensions.shift();
		}
		return this._config.file;
	}

	/**
	 * Resolve the URL for a given icon name
	 * @param iconName The icon name to return a URL for
	 */
	public iconUrl(iconName: string): string {
		const iconPath = this._config.iconDefinitions[iconName] && this._config.iconDefinitions[iconName].iconPath;
		if (!iconPath) {
			throw new TypeError(`Icon named "${iconName}" not found.`);
		}
		return new globalURL(iconPath, this._sourcePath).toString();
	}
}

/**
 * Load the JSON data from a file for icons and return an instance of an icon resolver which is bound to the data from
 * the configuration file.
 * @param filename The filename of the JSON configuration for the icons.
 */
export async function load(filename: string): Promise<IconJson> {
	return (await request(filename)).json<IconJson>();
}
