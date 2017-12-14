import postcss = require('postcss');

declare class CssModuleLoader {
	constructor(root: string, plugins: any[]);
}

interface Options {
	scopeBehaviour?: 'global' | 'local';
	globalModulePaths?: RegExp[];
	generateScopeName?: string | ((name: string, filename: string, css: string) => string);
	root?: string;
	Loader?: CssModuleLoader;
	getJSON?(filename: string | undefined, json: { [className: string]: string }): void;
}

declare function postcssModules(options: Options): postcss.Plugin<Options>;

export = postcssModules;
