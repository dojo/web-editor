declare module 'postcss-cssnext' {
	import postcss = require('postcss');

	interface Options {
		console?: typeof console;
		warnForDuplicates?: boolean;
		warnForDuplication?: boolean;
		features?: {[name: string]: any};
		browsers: string[];
	}

	// TODO: fix Options
	function cssnext(options: any): postcss.Plugin<Options>;

	export = cssnext;
}
