import { ProjectFileType } from '@dojo/cli-emit-editor/interfaces/editor';
import Evented from '@dojo/core/Evented';
import project from './project';

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
	css: string[],
	bodyAttributes: { [attr: string]: string; },
	html: string,
	dependencies: { [pkg: string]: string; },
	modules: { [mid: string]: string }
): string {
	const [ preScripts, preCss, preBodyAttributes, preHtml, preDependencies, preModules, ...postscript ] = strings;
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

	let scriptsText = '';
	scripts.forEach((src) => {
		scriptsText += `<script src="${src}"></script>\n\t`;
	});

	let bodyAttributesText = '';
	for (const attr in bodyAttributes) {
		bodyAttributesText += ` $[attr]="${bodyAttributes[attr]}"`;
	}

	return preScripts + scriptsText + preCss + cssText + preBodyAttributes + bodyAttributesText + preHtml + html
		+ preDependencies + pathsText + preModules + modulesText + postscript.join('\n');
}

/**
 * Writes to the document of an `iframe`
 * @param iframe The target `iframe`
 * @param source The source to be written
 */
function writeIframeDoc(iframe: HTMLIFrameElement, source: string) {
	iframe.contentWindow.document.write(source);
}

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

export interface GetDocOptions {
	css?: string[];
	bodyAttributes?: { [attr: string]: string; };
	dependencies: { [pkg: string]: string; };
	html?: string;
	modules: { [mid: string]: string; };
	scripts?: string[];
}

export default class Runner extends Evented {
	/**
	 * The private iframe that the project will run in
	 */
	private _iframe: HTMLIFrameElement | undefined;

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
				<script src="https://unpkg.com/@dojo/loader@beta1/loader.min.js"></script>
				<script>
					require.config({
						paths: ${dependencies},
						packages: [
							{ name: 'cldr', location: 'https://unpkg.com/cldrjs@^0.4.6/dist/cldr', main: '../cldr' },
							{ name: 'globalize', main: '/dist/globalize' },
							{ name: 'maquette', main: '/dist/maquette.min' },
							{ name: 'pepjs', main: 'dist/pep' },
							{ name: 'tslib', location: 'https://unpkg.com/tslib@^1.6.0/', main: 'tslib' }
						]
					});
					${modules}
					require([ 'tslib', 'src/main' ], function () {});
				</script>
			</body>
			</html>`;
	}

	/**
	 * Get the emit from the current project and run it in the runner's `iframe`
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

		const css = program
			.filter(({ type }) => type === ProjectFileType.CSS)
			.map(({ text }) => text);

		const dependencies = project.getDependencies();

		const { css: indexCss, body: html, scripts } = parseHtml(project.getIndexHtml());
		if (indexCss) {
			css.unshift(indexCss);
		}

		const source = this.getDoc({
			css,
			html,
			dependencies,
			modules,
			scripts
		});
		writeIframeDoc(this._iframe, source);
	}
}
