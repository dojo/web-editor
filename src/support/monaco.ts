import request from '@dojo/core/request';
import Projector from '@dojo/widget-core/mixins/Projector';
import { WidgetProperties } from '@dojo/widget-core/interfaces';
import MonacoScript from './MonacoScript';

export interface ThemeJson {
	name: string;
	type: string;
	colors: { [color: string]: string };
	rules: monaco.editor.ITokenThemeRule[];
}

async function loadThemeFile(filename: string): Promise<ThemeJson> {
	return (await request(filename)).json<ThemeJson>();
}

/* istanbul ignore next */
function getEditorTheme(theme: ThemeJson): monaco.editor.IStandaloneThemeData {
	const base = theme.type === 'dark' ? 'vs-dark' : theme.type === 'hc' ? 'hc-black' : 'vs';
	const { colors, rules } = theme;
	return {
		base,
		inherit: true,
		rules,
		colors
	};
}

let projector: Projector<WidgetProperties> & MonacoScript;

/**
 * Load monaco editor into the page
 * @returns A Promise that resolves when monaco is loaded and ready
 */
/* istanbul ignore next */
export function loadMonaco(): Promise<typeof monaco> {
	if (!projector) {
		projector = new (Projector(MonacoScript))();
		projector.append();
	}

	return projector.promise;
}

/**
 * Load a monaco theme and set it, ensuring that monaco is loaded first
 * @returns a Promise that resolves when monaco is loaded and the theme is set
 */
export async function loadTheme(filename: string): Promise<void> {
	const theme = await loadThemeFile(filename);
	const monacoNamespace = await loadMonaco();
	monacoNamespace.editor.defineTheme(theme.name, getEditorTheme(theme));
	monacoNamespace.editor.setTheme(theme.name);
}

export default loadMonaco;
