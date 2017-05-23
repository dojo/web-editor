import Map from '@dojo/shim/Map';
import { sandbox as sinonSandbox } from 'sinon';
import { Diagnostic } from 'typescript';

const sandbox = sinonSandbox.create();
export const extraLibMap = new Map<string, string>();

export const compilerOptionsDiagnostics: Diagnostic[] = [];
export const outputFilesMap = new Map<string, { name: string; writeByteOrderMark: boolean, text: string; }[]>();

export const createModelSpy = sandbox.spy((text: string, language: string, filename: string) => {
	return {
		getValue: sandbox.spy(() => {
			return text;
		}),
		uri: {
			fsPath: filename,
			toString() {
				return filename;
			}
		}
	};
});
export const uriFileSpy = sandbox.spy((filename: string) => {
	return 'file:///' + filename;
});
export const addExtraLibSpy = sandbox.spy((text: string, filename: string) => {
	if (extraLibMap.has(filename)) {
		throw new Error('Duplicate File!');
	}
	extraLibMap.set(filename, text);
	return {
		dispose() {
			extraLibMap.delete(filename);
		}
	};
});
export const setCompilerOptionsSpy = sandbox.spy();
export const languageServiceStub = {
	getEmitOutput(filename: string) {
		return Promise.resolve({
			outputFiles: outputFilesMap.get(filename) || [ {
				name: '',
				writeByteOrderMark: false,
				text: ''
			} ],
			emitSkipped: false
		});
	},
	getCompilerOptionsDiagnostics() {
		return Promise.resolve(compilerOptionsDiagnostics);
	},
	getSemanticDiagnostics() {
		return Promise.resolve([]);
	},
	getSyntacticDiagnostics() {
		return Promise.resolve([]);
	}
};
export const workerSpy = sandbox.spy(() => {
	return Promise.resolve(languageServiceStub);
});
export const getTypeScriptWorkerSpy = sandbox.spy(() => {
	return Promise.resolve(workerSpy);
});

export function resetSandbox() {
	sandbox.reset();
	extraLibMap.clear();
	while (compilerOptionsDiagnostics.length) {
		compilerOptionsDiagnostics.pop();
	}
	outputFilesMap.clear();
}

export function restoreSandbox() {
	sandbox.restore();
	extraLibMap.clear();
}

enum ModuleKind {
	None = 0,
	CommonJS = 1,
	AMD = 2,
	UMD = 3,
	System = 4,
	ES2015 = 5
}

export enum ModuleResolutionKind {
	Classic = 1,
	NodeJs = 2
}

enum ScriptTarget {
	ES3 = 0,
	ES5 = 1,
	ES2015 = 2,
	ES2016 = 3,
	ES2017 = 4,
	ESNext = 5,
	Latest = 5
}

export default {
	editor: {
		createModel: createModelSpy
	},
	languages: {
		typescript: {
			getTypeScriptWorker: getTypeScriptWorkerSpy,
			ModuleKind,
			ModuleResolutionKind,
			ScriptTarget,
			typescriptDefaults: {
				addExtraLib: addExtraLibSpy,
				setCompilerOptions: setCompilerOptionsSpy
			}
		}
	},
	Uri: {
		file: uriFileSpy
	}
};
