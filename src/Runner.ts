import { createHandle } from '@dojo/core/lang';
import { v, w } from '@dojo/widget-core/d';
import { Constructor, DNode, VirtualDomProperties, WidgetProperties } from '@dojo/widget-core/interfaces';
import WidgetBase, { afterRender } from '@dojo/widget-core/WidgetBase';
import { ThemeableMixin, ThemeableProperties, theme } from '@dojo/widget-core/mixins/Themeable';
import DomWrapper from '@dojo/widget-core/util/DomWrapper';
import { Program } from './project';
import * as css from './styles/runner.m.css';
import * as base64 from './support/base64';
import DOMParser from './support/DOMParser';
import { wrapCode } from './support/sourceMap';

/**
 * @type RunnerProperties
 *
 * Properties that can be set on a Runner widget
 *
 * @property loader A URI that points to an AMD loader which will be used when running the program.
 *                  Defaults to `https://unpkg.com/@dojo/loader/loader.min.js`
 * @property src A URI that points to the `src` to set on the Runner's `iframe`. Defaults to
 *               `../support/blank.html`
 * @property onError A method that will be called whenever there is an error in the running program
 * @property onRun A method that will be called when the `Runner` has fully loaded the program.  *Note* this does not
 *                 represent the state of the running program, it simply indicates that the `Runner` no longer has
 *                 involvement in the process of loading the program
 */
export interface RunnerProperties extends Partial<Program>, WidgetProperties, ThemeableProperties {
	loader?: string;
	src?: string;

	onError?(err: Error): void;
	onRun?(): void;
}

/**
 * The semver for the `tslib` package, which provides the TypeScript helper functions
 */
const TSLIB_SEMVER = '^1.6.0';

/**
 * The default URI for the AMD loader to use when running a program
 */
const DEFAULT_LOADER_URI = 'https://unpkg.com/@dojo/loader/loader.min.js';
const DEFAULT_IFRAME_SRC = '../support/blank.html';

/**
 * A map of custom package data that needs to be added if this package is part of project that is being run
 */
const PACKAGE_DATA: { [pkg: string]: string } = {
	cldrjs: `{ name: 'cldr', location: 'https://unpkg.com/cldrjs@<%SEMVER>/dist/cldr', main: '../cldr' }`,
	globalize: `{ name: 'globalize', main: '/dist/globalize' }`,
	maquette: `{ name: 'maquette', main: '/dist/maquette.min' }`,
	pepjs: `{ name: 'pepjs', main: 'dist/pep' }`,
	tslib: `{ name: 'tslib', location: 'https://unpkg.com/tslib@${TSLIB_SEMVER}/', main: 'tslib' }`
};

/**
 * Generate an HTML document source
 * @param strings Array of template strings
 * @param css The CSS as an array of strings
 * @param html The HTML to be used in the body of the document
 * @param dependencies A map of package dependencies required
 * @param modules Any modules to be injected into the page
 * @return The generated HTML document
 */
function docSrc(
	strings: TemplateStringsArray,
	scripts: string[],
	css: { name: string; text: string; }[],
	bodyAttributes: { [attr: string]: string; },
	html: string,
	loaderSrc: string,
	dependencies: { [pkg: string]: string; },
	packages: string[],
	modules: { [mid: string]: { code: string, map: string } }
): string {
	const paths: string[] = [];
	for (const pkg in dependencies) {
		paths.push(`'${pkg}': 'https://unpkg.com/${pkg}@${dependencies[pkg]}'`);
	}
	const pathsText = `{\n\t\t\t\t\t\t\t${paths.join(',\n\t\t\t\t\t\t\t')}\n\t\t\t\t\t\t}`;

	const packagesText = `[
							${packages.join(',\n\t\t\t\t\t\t\t')}
						]`;

	let modulesText = '';
	for (const mid in modules) {
		/* inject each source module as its own <script> block */
		const filename = mid + '.js';
		modulesText += '<script>';
		const source = wrapCode(`cache['${mid}'] = function () {\n`, modules[mid], '\n};\n');
		modulesText += source.code;
		/* if we have a sourcemap then we encode it and add it to the page */
		if (modules[mid].map) {
			const map = source.map.toJSON();
			map.file = filename;
			modulesText += `//# sourceMappingURL=data:application/json;base64,${base64.encode(JSON.stringify(map))}\n`;
		}
		/* adding the sourceURL gives debuggers a "name" for this block of code */
		modulesText += `//# sourceURL=${filename}\n`;
		modulesText += '</script>\n';
	}

	const cssText = css.map(({ name, text }) => {
		/* when external CSS is brought into a document, its URL URIs might not be encoded, this will encode them */
		const encoded = text.replace(/url\(['"]?(.*?)["']?\)/ig, (match, p1: string) => `url('${encodeURI(p1)}')`);
		return `<style>\n${encoded}\n</style>`;
	}).join('\n');

	let scriptsText = '';
	scripts.forEach((src) => {
		scriptsText += `<script src="${src}"></script>\n\t`;
	});

	let bodyAttributesText = '';
	for (const attr in bodyAttributes) {
		bodyAttributesText += ` ${attr}="${bodyAttributes[attr]}"`;
	}

	const parts = [ scriptsText, cssText, bodyAttributesText, html, loaderSrc, pathsText, packagesText, modulesText ];

	const text = parts
		.reduce((previous, text, index) => {
			return previous + strings[index] + text + '\n';
		}, '');

	return text + strings.slice(parts.length).join('\n');
}

/**
 * Return the information for packages based on dependencies for the project
 * @param dependencies The project dependencies
 */
function getPackages(dependencies: { [pkg: string]: string; }): string[] {
	const packages: string[] = [];
	Object.keys(PACKAGE_DATA).forEach((key) => {
		if (key in dependencies && key !== 'tslib') {
			packages.push(PACKAGE_DATA[key].replace('<%SEMVER>', dependencies[key]));
		}
	});
	packages.push(PACKAGE_DATA['tslib']); /* we are always going to inject this one */
	return packages;
}

/**
 * Generate an HTML page which represents the Runner properties
 * @param param0 Properties from the Runner to be used to specify the document
 */
function getSource({ css = [], dependencies = {}, loader = DEFAULT_LOADER_URI, html = '', modules = {} }: RunnerProperties): string {
	const { attributes, body, css: text, scripts } = parseHtml(html);
	if (text) {
		css.unshift({ name: 'project index', text });
	}

	return docSrc`<!DOCTYPE html>
			<html>
			<head>
				${scripts}
				${css}
			</head>
			<body${attributes}>
				${body}
				<script src="${loader}"></script>
				<script>require.config({
	paths: ${dependencies},
	packages: ${getPackages(dependencies)}
});

var cache = {};
//# sourceURL=web-editor/config.js
				</script>
				${modules}
				<script>require.cache(cache);
/* workaround for dojo/loader#124 */
require.cache({});

require([ 'tslib', '@dojo/core/request', '../support/providers/amdRequire' ], function () {
	var request = require('@dojo/core/request').default;
	var getProvider = require('../support/providers/amdRequire').default;
	request.setDefaultProvider(getProvider(require));
	require([ 'src/main' ], function () { });
});
//# sourceURL=web-editor/bootstrap.js
				</script>
			</body>
			</html>`;
}

/**
 * Determine if a string is a local or remote URI, returning `true` if remote, otherwise `false`
 * @param text string of text to check
 */
function isRemoteURI(text: string): boolean {
	const currenthost = `${window.location.protocol}//${window.location.hostname}`;
	if (text.indexOf(currenthost) >= 0) {
		return false;
	}
	return /^http(?:s)?:\/{2}/.test(text);
}

/**
 * Extract some specific content from an HTML document and return it
 * @param content The source HTML content
 */
function parseHtml(content: string): { attributes: { [attr: string]: string }, body: string, css: string, scripts: string[] } {
	const parser = new DOMParser();
	const doc = parser.parseFromString(content, 'text/html');
	const scriptNodes = doc.querySelectorAll('script');
	const scripts: string[] = [];
	for (let i = 0; i < scriptNodes.length; i++) {
		const script = scriptNodes[i];
		script.parentElement && script.parentElement.removeChild(script);
		if (script.src && isRemoteURI(script.src)) {
			scripts.push(script.src);
		}
	}
	const css: string[] = [];
	const styles = doc.querySelectorAll('style');
	for (let i = 0; i < styles.length; i++) {
		const style = styles[i];
		if (style.textContent && style.getAttribute('scoped') === null) {
			css.push(style.textContent);
		}
	}
	const attributes: { [attr: string]: string } = {};
	for (let i = 0; i < doc.body.attributes.length; i++) {
		attributes[doc.body.attributes[i].name] = doc.body.attributes[i].value;
	}
	return {
		attributes, // not implmeneted yet
		body: doc.body && doc.body.innerHTML || '',
		css: css.join('\n'),
		scripts
	};
}

/**
 * Write out the provided `source` to the target `iframe` and register an event listener for the `error` event on the `iframe`
 * @param iframe The `iframe` to have its document written to
 * @param source The document text to be written
 * @param errorListener The error listener that will be attached to the content window's error event
 */
async function writeIframeDoc(iframe: HTMLIFrameElement, source: string, errorListener: (evt: ErrorEvent) => void): Promise<void> {
	return new Promise<void>((resolve, reject) => {
		function onLoadListener() {
			iframe.removeEventListener('load', onLoadListener);
			iframe.contentWindow.document.write(source);
			iframe.contentWindow.document.close();
			iframe.contentWindow.addEventListener('error', errorListener);
			resolve();
		}

		iframe.contentWindow.removeEventListener('error', errorListener);
		iframe.addEventListener('load', onLoadListener);
		iframe.contentWindow.location.reload();
	});
}

const RunnerBase = ThemeableMixin(WidgetBase);

/**
 * A widget which will render its properties into a _runnable_ application within an `iframe`
 */
@theme(css)
export default class Runner extends RunnerBase<RunnerProperties> {
	private _iframe: HTMLIFrameElement;
	private _IframeDom: Constructor<WidgetBase<VirtualDomProperties & WidgetProperties>>;
	private _onIframeError = (evt: ErrorEvent) => {
		evt.preventDefault();
		const { onError } = this.properties;
		onError && onError(evt.error);
	}
	private _updating = false;

	constructor() {
		super();
		const iframe = this._iframe = document.createElement('iframe');
		iframe.setAttribute('src', DEFAULT_IFRAME_SRC);

		/* TODO: Remove when https://github.com/dojo/widget-core/issues/553 resolved */
		iframe.classList.add(css.iframe);

		this._IframeDom = DomWrapper(iframe);
		this.own(createHandle(() => {
			if (iframe.contentWindow) {
				iframe.contentWindow.removeEventListener('error', this._onIframeError);
			}
		}));
	}

	@afterRender()
	public updateSource(node?: DNode): DNode | undefined {
		if (this._updating) {
			return node;
		}
		if (this.properties.modules) {
			this._updating = true;
			const source = getSource(this.properties);
			writeIframeDoc(this._iframe, source, this._onIframeError)
				.then(() => {
					this._updating = false;
					const { onRun } = this.properties;
					onRun && onRun();
				});
		}
		return node;
	}

	public render() {
		return v('div', {
			classes: this.classes(css.root)
		}, [ w(this._IframeDom, {
			key: 'runner',
			src: this.properties.src || DEFAULT_IFRAME_SRC
		}) ]);
	}
}
