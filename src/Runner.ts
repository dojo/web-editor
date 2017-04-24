import { ProjectFileType } from '@dojo/cli-export-project/interfaces/project.json';
import Evented from '@dojo/core/Evented';
import project from './project';

export interface GetDocOptions {
	css?: { name: string; text: string; }[];
	bodyAttributes?: { [attr: string]: string; };
	dependencies: { [pkg: string]: string; };
	html?: string;
	modules: { [mid: string]: string; };
	scripts?: string[];
}

/**
 * A map of custom package data that needs to be added if this package is part of project that is being run
 */
const PACKAGE_DATA: { [pkg: string]: string } = {
	cldrjs: `{ name: 'cldr', location: 'https://unpkg.com/cldrjs@^0.4.6/dist/cldr', main: '../cldr' }`,
	globalize: `{ name: 'globalize', main: '/dist/globalize' }`,
	maquette: `{ name: 'maquette', main: '/dist/maquette.min' }`,
	pepjs: `{ name: 'pepjs', main: 'dist/pep' }`,
	tslib: `{ name: 'tslib', location: 'https://unpkg.com/tslib@^1.6.0/', main: 'tslib' }`
};

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
	scripts: string[],
	css: { name: string; text: string; }[],
	bodyAttributes: { [attr: string]: string; },
	html: string,
	dependencies: { [pkg: string]: string; },
	packages: string[],
	modules: { [mid: string]: string }
): string {
	const [ preScripts, preCss, preBodyAttributes, preHtml, preDependencies, prePackages, preModules, ...postscript ] = strings;

	const paths: string[] = [];
	for (const pkg in dependencies) {
		paths.push(`'${pkg}': 'https://unpkg.com/${pkg}@${dependencies[pkg]}'`);
	}
	const pathsText = `{\n\t\t\t\t\t\t\t${paths.join(',\n\t\t\t\t\t\t\t')}\n\t\t\t\t\t\t}`;

	const packagesText = `[
							${packages.join(',\n\t\t\t\t\t\t\t')}
						]`;

	let modulesText = `var cache = {\n`;
	for (const mid in modules) {
		modulesText += `\t'${mid}': function () {\n${modules[mid]}\n},\n`;
	}
	modulesText += `};\nrequire.cache(cache);\n/* workaround for dojo/loader#124 */\nrequire.cache({});\n`;

	const cssText = css.map(({ name, text }) => {
		/* when external CSS is brought into a document, its URL URIs might not be encoded, this will encode them */
		const encoded = text.replace(/url\(['"]?(.*?)["']?\)/ig, (match, p1: string) => `url('${encodeURI(p1)}')`);
		return `<style>\n/* from: ${name} */\n\n${encoded}\n</style>`;
	}).join('\n');

	let scriptsText = '';
	scripts.forEach((src) => {
		scriptsText += `<script src="${src}"></script>\n\t`;
	});

	let bodyAttributesText = '';
	for (const attr in bodyAttributes) {
		bodyAttributesText += ` $[attr]="${bodyAttributes[attr]}"`;
	}

	return preScripts + scriptsText + preCss + cssText + preBodyAttributes + bodyAttributesText + preHtml + html
		+ preDependencies + pathsText + prePackages + packagesText + preModules + modulesText + postscript.join('\n');
}

/**
 * Return the information for packages based on dependencies for the project
 * @param dependencies The project dependencies
 */
function getPackages(dependencies: { [pkg: string]: string; }): string[] {
	const packages: string[] = [];
	Object.keys(PACKAGE_DATA).forEach((key) => {
		if (key in dependencies && key !== 'tslib') {
			packages.push(PACKAGE_DATA[key]);
		}
	});
	packages.push(PACKAGE_DATA['tslib']); /* we are always going to inject this one */
	return packages;
}

/**
 * Extract some specific content from an HTML document and return it
 * @param content The source HTML content
 */
function parseHtml(content: string): { css: string, body: string, scripts: string[] } {
	const parser = new DOMParser();
	const doc = parser.parseFromString(content, 'text/html');
	const scriptNodes = doc.querySelectorAll('script');
	const scripts: string[] = [];
	for (let i = 0; i < scriptNodes.length; i++) {
		const script = scriptNodes[i];
		script.parentElement && script.parentElement.removeChild(script);
		if (script.src && /^http(?:s)?:\/{2}/.test(script.src)) {
			scripts.push(script.src);
		}
	}
	const css: string[] = [];
	const styles = doc.querySelectorAll('style');
	for (let i = 0; i < styles.length; i++) {
		const style = styles[i];
		if (style.textContent) {
			css.push(style.textContent);
		}
	}
	return {
		css: css.join('\n'),
		body: doc.body && doc.body.innerHTML || '',
		scripts
	};
}

/**
 * Writes to the document of an `iframe`
 * @param iframe The target `iframe`
 * @param source The source to be written
 */
async function writeIframeDoc(iframe: HTMLIFrameElement, source: string): Promise<void> {
	return new Promise<void>((resolve) => {
		function onLoadListener () {
			iframe.contentWindow.document.write(source);
			iframe.contentWindow.document.close();
			iframe.removeEventListener('load', onLoadListener);
			resolve();
		}

		iframe.addEventListener('load', onLoadListener);
		iframe.contentWindow.location.reload();
	});
}

export default class Runner extends Evented {
	/**
	 * The private iframe that the project will run in
	 */
	private _iframe: HTMLIFrameElement;

	/**
	 * Create a runner instance attached to a specific `iframe`
	 * @param iframe The `iframe` that should be used
	 */
	constructor(iframe: HTMLIFrameElement) {
		super();
		this._iframe = iframe;
	}

	/**
	 * Generate the document
	 * @param param0 The options to use
	 */
	getDoc({ css = [], bodyAttributes = {}, dependencies, html = '', modules, scripts = [] }: GetDocOptions): string {
		return docSrc`<!DOCTYPE html>
			<html>
			<head>
				${scripts}
				${css}
			</head>
			<body${bodyAttributes}>
				${html}
				<script src="https://unpkg.com/@dojo/loader/loader.min.js"></script>
				<script>
					require.config({
						paths: ${dependencies},
						packages: ${getPackages(dependencies)}
					});
					${modules}
					require([ 'tslib', '@dojo/core/request', '../support/providers/amdRequire' ], function () {
						var request = require('@dojo/core/request').default;
						var getProvider = require('../support/providers/amdRequire').default;
						request.setDefaultProvider(getProvider(require));
						require([ 'src/main' ], function () { });
					});
				</script>
			</body>
			</html>`;
	}

	/**
	 * Get the emit from the current project and run it in the runner's `iframe`
	 */
	async run(): Promise<void> {
		if (!project.isLoaded()) {
			throw new Error('Project not loaded.');
		}

		const program = await project.emit();

		const modules = program
			.filter(({ type }) => type === ProjectFileType.JavaScript)
			.reduce((map, { name, text }) => {
				map[name.replace(/\.js$/, '')] = text;
				return map;
			}, {} as { [mid: string]: string });

		const css = program
			.filter(({ type }) => type === ProjectFileType.CSS)
			.map(({ name, text }) => { return { name, text }; });

		const dependencies = project.getDependencies();

		const { css: text, body: html, scripts } = parseHtml(project.getIndexHtml());
		if (text) {
			css.unshift({ name: 'project index', text });
		}

		const source = this.getDoc({
			css,
			html,
			dependencies,
			modules,
			scripts
		});
		await writeIframeDoc(this._iframe, source);
	}
}
