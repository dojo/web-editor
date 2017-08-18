declare module 'postcss-cssnext' {
	import postcss = require('postcss');

	interface Options {
		console?: typeof console;
		warnForDuplicates?: boolean;
		warnForDeprecation?: boolean;
		features?: {[name: string]: any};
		browsers?: string;
	}

	function cssnext(options: Options): postcss.Plugin<Options>;

	export = cssnext;
}
