import request from '@dojo/core/request';

export interface ThemeJson {
	name: string;
	type: string;
	colors: { [color: string]: string };
	rules: monaco.editor.ITokenThemeRule[];
}

async function loadThemeFile(filename: string): Promise<ThemeJson> {
	return (await request(filename)).json<ThemeJson>();
}

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

export async function load(filename: string): Promise<void> {
	const theme = await loadThemeFile(filename);
	monaco.editor.defineTheme(theme.name, getEditorTheme(theme));
	monaco.editor.setTheme(theme.name);
}
