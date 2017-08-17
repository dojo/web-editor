// import 'vs/editor/editor.main'; /* imported for side-effects */

import { ProjectJson, ProjectFile, ProjectFileType } from '@dojo/cli-export-project/interfaces/project.json';
import Evented from '@dojo/core/Evented';
import { assign } from '@dojo/core/lang';
import request from '@dojo/core/request';
import { find, includes } from '@dojo/shim/array';
import WeakMap from '@dojo/shim/WeakMap';
import { DiagnosticMessageChain, OutputFile } from 'typescript';
import { getDefinitions, getEmit as getCssEmit } from './support/css';
import { getEmit as getJsonEmit } from './support/json';
import xhr from './support/providers/xhr';

import { EmitFile, PromiseLanguageService, TypeScriptWorker } from './interfaces';

/**
 * Interface that provides the data required to run a program.
 */
export interface Program {
	/**
	 * Blocks of CSS that the application requires to function properly
	 */
	css: { name: string; text: string; }[];

	/**
	 * Package dependencies which the program requires
	 */
	dependencies: { [pkg: string]: string; };

	/**
	 * The HTML document for the program
	 */
	html: string;

	/**
	 * Modules that make up the program, including their source maps
	 */
	modules: { [mid: string]: { code: string; map: string; } };
}

/**
 * Interface for private `ProjectFile` data the project needs to track for project files.
 */
interface ProjectFileData {
	/**
	 * Set to `true` if the model for the file has been updated in the editor, otherwise `false`.
	 */
	dirty?: boolean;

	/**
	 * Extra Lib Handle.  When registering files as extra libs in the TypeScript defaults in monaco-editor and we
	 * subsequently need to update them, we need to store the handle to remove them from the environment.
	 */
	extraLibHandle?: monaco.IDisposable;

	/**
	 * The associated monaco-editor model for a project file object.
	 */
	model?: monaco.editor.IModel;
}

/* Changes to a provider that doesn't have issue https://github.com/dojo/core/issues/328 */
request.setDefaultProvider(xhr);

/**
 * Flatten a TypeScript diagnostic message
 *
 * Ported from `typescript` due to the fact that this is not exposed via `monaco-editor`
 *
 * @param messageText The text of the diagnostic message
 * @param newLine The newline character to use when flattening
 */
function flattenDiagnosticMessageText(messageText: string | DiagnosticMessageChain, newLine: string): string {
	if (typeof messageText === 'string') {
		return messageText;
	}
	else {
		let diagnosticChain = messageText;
		let result = '';

		let indent = 0;
		while (diagnosticChain) {
			if (indent) {
				result += newLine;

				for (let i = 0; i < indent; i++) {
					result += '  ';
				}
			}
			result += diagnosticChain.messageText;
			indent++;
			diagnosticChain = diagnosticChain.next!;
		}

		return result;
	}
}

/**
 * Create a monaco-editor model for the specified project file
 * @param param0 The project file to create the model from
 */
function createMonacoModel({ name: filename, text, type }: ProjectFile): monaco.editor.IModel {
	return monaco.editor.createModel(text, getLanguageFromType(type), monaco.Uri.file(filename));
}

/**
 * Convert a `ProjectFileType` to a monaco-editor language
 * @param type The type to get a monaco-editor language for
 */
function getLanguageFromType(type: ProjectFileType): string {
	switch (type) {
	case ProjectFileType.Definition:
	case ProjectFileType.TypeScript:
	case ProjectFileType.Lib:
		return 'typescript';
	case ProjectFileType.HTML:
		return 'html';
	case ProjectFileType.JavaScript:
		return 'javascript';
	case ProjectFileType.Markdown:
		return 'markdown';
	case ProjectFileType.CSS:
		return 'css';
	case ProjectFileType.SourceMap:
	case ProjectFileType.JSON:
		return 'json';
	case ProjectFileType.PlainText:
		return 'plaintext';
	case ProjectFileType.XML:
		return 'xml';
	default:
		return 'unknown';
	}
}

type ScriptTarget = monaco.languages.typescript.ScriptTarget;

function getScriptTarget(type: string): ScriptTarget {
	const ScriptTarget = monaco.languages.typescript.ScriptTarget;
	switch (type) {
	case 'es3':
		return ScriptTarget.ES3;
	case 'es5':
		return ScriptTarget.ES5;
	case 'es6':
	case 'es2015':
		return ScriptTarget.ES2015;
	case 'es7':
	case 'es2016':
		return ScriptTarget.ES2016;
	case 'es8':
	case 'es2017':
		return ScriptTarget.ES2017;
	case 'esnext':
		return ScriptTarget.ESNext;
	case 'latest':
	default:
		return ScriptTarget.ES5;
	}
}

export class Project extends Evented {
	/**
	 * The loaded project bundle structure
	 */
	private _project: ProjectJson | undefined;

	/**
	 * A map of meta data related to project files
	 */
	private _fileMap = new WeakMap<ProjectFile, ProjectFileData>();

	/**
	 * Check if there are any emit errors for a given file
	 * @param services The language services to check
	 * @param filename The reference filename
	 */
	private async _checkEmitErrors(services: PromiseLanguageService, filename: string): Promise<void> {
		const diagnostics = [
			...await services.getCompilerOptionsDiagnostics(),
			...await services.getSemanticDiagnostics(filename),
			...await services.getSyntacticDiagnostics(filename)
		];

		diagnostics.forEach((diagnostic) => {
			const message = flattenDiagnosticMessageText(diagnostic.messageText, '\n');
			if (diagnostic.file && diagnostic.start) {
				const { line, character } = diagnostic.file.getLineAndCharacterOfPosition(diagnostic.start);
				console.warn(`Error ${diagnostic.file.fileName} (${line + 1},${character + 1}): ${message}`);
			}
			else {
				console.warn(`Error: ${message}`);
			}
		});
	}

	/**
	 * An async function which resolves with the parsed text of the project bundle
	 * @param filename The filename to load the bundle from
	 */
	private async _loadBundle(filename: string): Promise<void> {
		this._project = await (await request(filename)).json<ProjectJson>();
	}

	/**
	 * Retrieve the project file meta data being tracked by the project
	 * @param file The project file
	 */
	private _getProjectFileData(file: ProjectFile): ProjectFileData {
		if (!this._fileMap.has(file)) {
			this._fileMap.set(file, {});
		}
		return this._fileMap.get(file)!;
	}

	/**
	 * The the environment files in the monaco-editor environment.  These are the "non-editable" files which support the
	 * project and are usually additional type definitions that the project depends upon.
	 */
	private _setEnvironmentFiles(): void {
		this._project!.environmentFiles.forEach(({ name: filename, text, type }) => {
			monaco.languages.typescript.typescriptDefaults.addExtraLib(text, (type === ProjectFileType.Lib ? '' : 'file:///') + filename);
		});
	}

	/**
	 * Ensure that any TypeScript project fies are part of the environment, so that TypeScript files can be edited with
	 * the full context of the project.
	 */
	private _setProjectFiles(): void {
		this._project!.files.forEach((file) => {
			const { name: filename, text, type } = file;
			if (type === ProjectFileType.TypeScript || type === ProjectFileType.Definition) {
				const fileData = this._getProjectFileData(file);
				fileData.extraLibHandle = monaco.languages.typescript.typescriptDefaults.addExtraLib(text, 'file:///' + filename);
			}
		});
	}

	/**
	 * Set the compiler options for the TypeScript environment based on what is provided by the project bundle, combined
	 * with additional settings that are required for use in the web-editor.
	 */
	private _setTypeScriptEnvironment(): void {
		type CompilerOptions = monaco.languages.typescript.CompilerOptions;
		const { compilerOptions = {} } = this._project!.tsconfig;
		const options: CompilerOptions = {};

		/* copied from tsconfig.json */
		const { experimentalDecorators, lib, noImplicitAny, noImplicitThis, noImplicitReturns, noLib, noUnusedLocals, noUnusedParameters, strictNullChecks, target, types } = compilerOptions;
		assign(options, <CompilerOptions> {
			experimentalDecorators,
			lib,
			noImplicitAny,
			noImplicitThis,
			noImplicitReturns,
			noLib,
			noUnusedLocals,
			noUnusedParameters,
			strictNullChecks,
			target: getScriptTarget(target),
			types
		});

		/* asserted for web editing */
		assign(options, <CompilerOptions> {
			allowNonTsExtensions: true, /* needed for compiling like this */
			inlineSources: true, /* we will embed the sources in the source maps */
			module: monaco.languages.typescript.ModuleKind.AMD, /* only support AMD, so only compile to AMD */
			moduleResolution: monaco.languages.typescript.ModuleResolutionKind.NodeJs, /* only support this for of module resolution */
			noEmitHelpers: true, /* we will add the helpers later */
			sourceMap: true /* we will generate sourcemaps and remap them when we add them to the page */
		});

		monaco.languages.typescript.typescriptDefaults.setCompilerOptions(options);
	}

	/**
	 * Flush any changes that have come from the editor back into the project files.
	 */
	private _updateBundle(): void {
		if (!this._project) {
			return;
		}
		this._project.files
			.filter(({ name }) => this.isFileDirty(name))
			.forEach((file) => {
				file.text = this.getFileModel(file.name).getValue();
				this.setFileDirty(file.name, true);
			});
	}

	/**
	 * Update a CSS Module by updating its definition file and adding it to the environment.
	 * @param cssModuleFile The CSS Module to update
	 */
	private async _updateCssModule(cssModuleFile: ProjectFile): Promise<void> {
		cssModuleFile.text = this.getFileText(cssModuleFile.name);
		let definitionFile = (await getDefinitions(cssModuleFile))[0];
		const existingDefinition = find(this._project!.files, (({ name }) => name === definitionFile.name));
		if (existingDefinition) {
			existingDefinition.text = definitionFile.text;
			definitionFile = existingDefinition;
		}
		else {
			this._project!.files.push(definitionFile);
		}

		/* update the extraLib for the definition file */
		const { name, text } = definitionFile;
		const fileData = this._getProjectFileData(definitionFile);
		if (fileData.extraLibHandle) {
			fileData.extraLibHandle.dispose();
		}
		fileData.extraLibHandle = monaco.languages.typescript.typescriptDefaults.addExtraLib(text, 'file:///' + name);
	}

	/**
	 * Take the currently loaded project and emit it
	 */
	async emit(): Promise<EmitFile[]> {
		if (!this._project) {
			throw new Error('Project not loaded.');
		}

		const typescriptFileUris = this._project.files
			.filter(({ type }) => type === ProjectFileType.Definition || type === ProjectFileType.TypeScript)
			.map(({ name }) => this.getFileModel(name).uri);
		const worker: TypeScriptWorker = await monaco.languages.typescript.getTypeScriptWorker();
		const services = await worker(...typescriptFileUris);

		const output = await Promise.all(typescriptFileUris.map(async (file) => {
			const filename = file.toString();
			const emitOutput = await services.getEmitOutput(filename);
			await this._checkEmitErrors(services, filename);
			return emitOutput;
		}));

		const cssFiles = await getCssEmit(...this._project.files /* add css modules */
			.filter(({ type }) => type === ProjectFileType.CSS)
			.map(({ name, type }) => { return { model: this.getFileModel(name), type }; })
			.map(({ model, type }) => { return { name: model.uri.fsPath.replace(/^\/\.\//, ''), text: model.getValue(), type }; }));

		const jsonFiles = getJsonEmit(...this._project.files /* add json files as a module */
			.filter(({ type }) => type === ProjectFileType.JSON)
			.map(({ name, type }) => { return { model: this.getFileModel(name), type }; })
			.map(({ model, type }) => { return { name: model.uri.fsPath.replace(/^\/\.\//, ''), text: model.getValue(), type }; }));

		const otherFiles = this._project.files /* add on other project files */
			.filter(({ type }) => type !== ProjectFileType.Definition && type !== ProjectFileType.TypeScript && type !== ProjectFileType.CSS && type !== ProjectFileType.JSON)
			.map(({ name, type }) => { return { model: this.getFileModel(name), type }; })
			.map(({ model, type }) => { return { name: model.uri.fsPath.replace(/^\/\.\//, ''), text: model.getValue(), type }; });

		return output
			.reduce((previous, output) => previous.concat(output.outputFiles), [] as OutputFile[])
			.map(({ text, name }) => { /* conform to emitted file format */
				return {
					text,
					name: name.replace('file:///', ''),
					type: /^(.*\.(?!map$))?[^.]*$/.test(name) ? ProjectFileType.JavaScript : ProjectFileType.SourceMap
				};
			})
			.concat(cssFiles, jsonFiles, otherFiles);
	}

	/**
	 * Return the currently loaded project bundle.
	 */
	get(): ProjectJson | undefined {
		this._updateBundle();
		return this._project;
	}

	/**
	 * The package dependencies for this project
	 * @param includeDev If `true` it will include development dependencies.  Defaults to `false`.
	 */
	getDependencies(includeDev = false): { [pkg: string]: string } {
		if (!this._project) {
			throw new Error('Project not loaded.');
		}
		return assign({}, this._project.dependencies.production, includeDev ? this._project.dependencies.development : undefined);
	}

	/**
	 * Retrieve a project file based on the file name from the project bundle, or return `undefined` if the file is not part of
	 * the project.
	 * @param filename The file name of the project file
	 */
	getFile(filename: string): ProjectFile | undefined {
		if (!this._project) {
			throw new Error('Project not loaded.');
		}
		return find(this._project.files, ({ name }) => name === filename);
	}

	/**
	 * Return an array of `ProjectFile` objects which are the files associated with the project.  By default it returns all of
	 * the files, but to filer based on file type, pass additional arguments of the file types to filter on.
	 * @param types Return only files that match these project file types
	 */
	getFiles(...types: ProjectFileType[]): ProjectFile[] {
		if (!this._project) {
			throw new Error('Project not loaded.');
		}
		const filenames = this._project.files.map(({ name }) => name);
		/* while sometimes, CSS Modules Definition files are included in a project bundle, and need to be part of the environment, they
		 * shouldn't be editable and therefore we won't return them */
		return this._project.files
			.filter(({ name, type }) => !(type === ProjectFileType.Definition && includes(filenames, name.replace(/\.d\.ts$/, ''))) && (types.length ? includes(types, type) : true));
	}

	/**
	 * Return a monaco-editor model for a specified file name.  Will throw if the filename is not part of the project.
	 * @param filename The file name of the project file
	 */
	getFileModel(filename: string): monaco.editor.IModel {
		const file = this.getFile(filename);
		if (!file) {
			throw new Error(`File "${filename}" is not part of the project.`);
		}
		const fileData = this._getProjectFileData(file);
		if (!fileData.model) {
			fileData.model = createMonacoModel(file);
		}
		return fileData.model;
	}

	/**
	 * Return an array of strings which are the names of the project files associated with the project.  By default it returns
	 * all of the files, but to filter based on file type, pass additional arguments of the file types to filter on.
	 * @param types Return only files that match these project file types
	 */
	getFileNames(...types: ProjectFileType[]): string[] {
		return this.getFiles(...types)
			.map(({ name }) => name);
	}

	/**
	 * Retrieve the text of the file from the project
	 * @param filename The file name of the project file
	 */
	getFileText(filename: string): string {
		return this.getFileModel(filename).getValue();
	}

	/**
	 * Retrieve the text for the index HTML that has been specified in the project
	 */
	getIndexHtml(): string {
		if (!this._project) {
			throw new Error('Project not loaded.');
		}
		return this.getFileText(this._project.index);
	}

	/**
	 * Resolves with an object which represents the current program which can then be run in a browser
	 */
	async getProgram(): Promise<Program> {
		const program = await this.emit();

		const modules = program
			.filter(({ type }) => type === ProjectFileType.JavaScript || type === ProjectFileType.SourceMap)
			.reduce((map, { name, text, type }) => {
				const mid = name.replace(/\.js(?:\.map)?$/, '');
				if (!(mid in map)) {
					map[mid] = { code: '', map: '' };
				}
				map[mid][type === ProjectFileType.JavaScript ? 'code' : 'map'] = text;
				return map;
			}, {} as { [mid: string]: { code: string; map: string; } });

		const css = program
			.filter(({ type }) => type === ProjectFileType.CSS)
			.map(({ name, text }) => { return { name, text }; });

		return {
			css,
			dependencies: this.getDependencies(),
			html: this.getIndexHtml(),
			modules
		};
	}

	/**
	 * Return `true` if the specified file name is part of the project, otherwise `false`.
	 * @param filename The file name
	 */
	includes(filename: string): boolean {
		return Boolean(this._project && includes(this.getFileNames(), filename));
	}

	/**
	 * Determine if a file, by name is _dirty_ and has not had its contents updated in the project bundle once being edited
	 * in the editor.
	 * @param filename The file name
	 */
	isFileDirty(filename: string): boolean {
		const file = this.getFile(filename);
		return Boolean(file && this._getProjectFileData(file).dirty);
	}

	/**
	 * Returns `true` if the project is loaded, otherwise `false`
	 */
	isLoaded(): boolean {
		return Boolean(this._project);
	}

	/**
	 * An async function which loads a project JSON bundle file and sets the monaco-editor environment to be
	 * to edit the project.
	 * @param filenameOrUrl The project file name or URL to load
	 */
	async load(filenameOrUrl: string): Promise<void> {
		if (this._project) {
			throw new Error('Project is already loaded.');
		}
		await this._loadBundle(filenameOrUrl);
		this._setTypeScriptEnvironment();
		this._setEnvironmentFiles();
		this._setProjectFiles();
	}

	/**
	 * Set (or unset) the file _dirty_ flag on a project file
	 * @param filename The file name
	 * @param reset Set to `true` to unset the _dirty_ flag on the file
	 */
	async setFileDirty(filename: string, reset?: boolean): Promise<void> {
		const file = this.getFile(filename);
		if (!file) {
			throw new Error(`File "${filename}" is not part of the project.`);
		}
		if (file.type === ProjectFileType.CSS) {
			/* the functionality of this method negates setting the dirty flag, so we won't */
			await this._updateCssModule(file);
		}
		else {
			this._getProjectFileData(file).dirty = !reset;
		}
	}
}

/* create singleton instance of project for default export */
const project = new Project();
export default project;
