import { ProjectFileType } from '@dojo/cli-export-project/interfaces/project.json';
import { EmitOutput, LanguageService, Diagnostic } from 'typescript';

export interface EmitFile {
	name: string;
	text: string;
	type: ProjectFileType;
}

export interface EmitError {
	message: string;
	lineNumber?: number;
	character?: number;
	filename?: string;
}

export interface PromiseLanguageService {
	getSyntacticDiagnostics(fileName: string): Promise<Diagnostic[]>;
	getSemanticDiagnostics(fileName: string): Promise<Diagnostic[]>;
	getCompilerOptionsDiagnostics(): Promise<Diagnostic[]>;
	getEmitOutput(fileName: string, emitOnlyDtsFiles?: boolean): Promise<EmitOutput>;
}

export interface TypeScriptWorker {
	(...uri: monaco.Uri[]): Promise<PromiseLanguageService>;
}
