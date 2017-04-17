import { ProjectFileType } from '@dojo/cli-emit-editor/interfaces/editor';
import Evented from '@dojo/core/Evented';
import has, { add as hasAdd } from '@dojo/has/has';
import project from './project';

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
 * @param html The HTML to be used in the body of the document
 * @param dependencies A map of package dependencies required
 * @param modules Any modules to be injected into the page
 */
function docSrc(
	strings: TemplateStringsArray,
	css: string[],
	bodyAttributes: { [attr: string]: string; },
	html: string,
	dependencies: { [pkg: string]: string; },
	modules: { [mid: string]: string }
): string {
	const [ preCss, preBodyAttributes, preHtml, preDependencies, preModules, ...postscript ] = strings;
	let pathsText = `{\n`;
	for (const pkg in dependencies) {
		pathsText += `\t'${pkg}': 'https://unpkg.com/${pkg}@${dependencies[pkg]}',\n`;
	}
	pathsText += `}\n`;

	let modulesText = `var cache = {\n`;
	for (const mid in modules) {
		modulesText += `\t'${mid}': function () {\n${modules[mid]}\n},\n`;
	}
	modulesText += `};\nrequire.cache(cache);\n/* workaround for dojo/loader#124 */\nrequire.cache({});\n`;

	const cssText = `<style>\n${css.join('\n')}\n\t\t\t\t</style>\n`;

	let bodyAttributesText = '';
	for (const attr in bodyAttributes) {
		bodyAttributesText += ` $[attr]="${bodyAttributes[attr]}"`;
	}

	return preCss + cssText + preBodyAttributes + bodyAttributesText + preHtml + html + preDependencies + pathsText
		+ preModules + modulesText + postscript.join('\n');
}

/**
 * Set the `srcdoc` on an `HTMLIFrameElement` in a way that works on browsers that don't directly support
 * setting that attribute.
 * @param iframe The iframe to set the `srcdoc` on
 * @param srcdoc The string that will be the `srcdoc` for the iframe
 */
function setSrcDoc(iframe: HTMLIFrameElement, srcdoc: string) {
	iframe.setAttribute('srcdoc', srcdoc);
	if (!has('dom-iframe-srcdoc')) {
		iframe.setAttribute('src', `javascript: window.frameElement.getAttribute('srcdoc');`);
	}
}

export interface GetDocOptions {
	css?: string[];
	bodyAttributes?: { [attr: string]: string; };
	dependencies: { [pkg: string]: string; };
	html?: string;
	modules: { [mid: string]: string; };
}

export default class Runner extends Evented {
	/**
	 * The private iframe that the project will run in
	 */
	private _iframe: HTMLIFrameElement | undefined;

	private _root: HTMLElement;

	constructor(root: HTMLElement) {
		super();
		this._root = root;
	}

	/**
	 * Generate the document
	 * @param param0 The options to use
	 */
	getDoc({ css = [], bodyAttributes = {}, dependencies, html = '', modules }: GetDocOptions): string {
		return docSrc`<!DOCTYPE html>
			<html>
			<head>
				${css}
			</head>
			<body${bodyAttributes}>
				${html}
				<script src="https://unpkg.com/@dojo/loader@beta1/loader.min.js"></script>
				<script>
					require.config({
						paths: ${dependencies},
						packages: [
							{ name: 'maquette', main: '/dist/maquette.min' },
							{ name: 'tslib', location: 'https://unpkg.com/tslib/', main: 'tslib' }
						]
					});

					${modules}

					require([ 'tslib', 'src/main' ], function () {});
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
	async run() {
		if (!project.isLoaded()) {
			throw new Error('Project not loaded.');
		}

		if (!this._iframe) {
			this._iframe = document.createElement('iframe');
		}

		const program = await project.emit();

		const modules = program
			.filter(({ type }) => type === ProjectFileType.JavaScript)
			.reduce((map, { name, text }) => {
				map[name.replace(/\.js$/, '')] = text;
				return map;
			}, {} as { [mid: string]: string });

		const dependencies = project.getDependencies();

		const srcdoc = this.getDoc({
			html: `<p>Welcome to dojo-test-app</p>
				<my-app></my-app>`,
			dependencies,
			modules
		});
		setSrcDoc(this._iframe, srcdoc);
		if (this._iframe.parentElement !== this._root) {
			this._root.appendChild(this._iframe);
		}
	}
}
