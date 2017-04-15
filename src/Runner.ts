import Evented from '@dojo/core/Evented';
import { add as hasAdd } from '@dojo/has/has';

declare global {
	interface HTMLIFrameElement {
		srcdoc: string;
	}
}

/**
 * Some browsers don't support `srcdoc` and will need to be polyfilled
 */
hasAdd('dom-iframe-srcdoc', 'srcdoc' in document.createElement('iframe'));

/**
 * Generate an HTML document source
 * @param strings Array of template strings
 * @param css The CSS as an array of strings
 * @param dependencies A map of package dependencies required
 * @param modules Any modules to be injected into the page
 */
function docSrc(strings: TemplateStringsArray, css: string[], dependencies: { [pkg: string]: string; }, modules: { [mid: string]: string }): string {
	const [ preCss, preDependencies, preModules, ...postscript ] = strings;
	let paths = `{\n`;
	for (const pkg in dependencies) {
		paths += `\t'${pkg}': 'https://unpkg.com/${pkg}@${dependencies[pkg]}',\n`;
	}
	paths += `}\n`;

	let modulesText = `var cache = {\n`;
	for (const mid in modules) {
		modulesText += `\t'${mid}': function () {` + modules[mid].replace(/define\s*\(\s*\[/, `define('${mid}', [`) + '},\n';
	}
	modulesText += `};\nrequire.cache(cache);\n/* workaround for dojo/loader#124 */\nrequire.cache({});\n`;

	return preCss + css.join('\n') + preDependencies + paths + preModules + modulesText + postscript.join('\n');
}

export default class Runner extends Evented {
	/**
	 * The private iframe that the project will run in
	 */
	private _iframe: HTMLIFrameElement;

	/**
	 * Generate a source document to be used in the iframe
	 *
	 * TODO: This should likely be private
	 * @param dependencies A map of dependencies to be injected into the document
	 * @param modules A map of modules to be injected into the document
	 * @param css An array of strings of CSS text to be injected into the document
	 */
	getDoc(dependencies: { [pkg: string]: string; }, modules: { [mid: string]: string; }, css: string[] = []): string {
		return docSrc`<!DOCTYPE html>
			<html>
			<head>
				${css}
			</head>
			<body>
				<p>Welcome to dojo-test-app</p>
				<my-app></my-app>
				<script src="https://unpkg.com/@dojo/loader@beta1/loader.min.js"></script>
				<script>
					require.config({
						paths: ${dependencies},
						packages: [
							{ name: 'maquette', main: '/dist/maquette.min' }
						]
					});

					${modules}

					require([ 'src/main' ], function () {});
				</script>
			</body>
			</html>`;
	}

	/**
	 * Attach an iframe to the root and run the supplied code
	 * @param root The HTMLElement that the iframe will be a child of
	 * @param dependencies A map of dependencies
	 * @param modules A map of modules to be injected
	 */
	run(root: HTMLElement, dependencies: { [pkg: string]: string; }, modules: { [mid: string]: string; }) {
		this._iframe = document.createElement('iframe');
		const srcdoc = this.getDoc(dependencies, modules);
		this._iframe.srcdoc = srcdoc;
		root.appendChild(this._iframe);
	}
}
