import { EmitOutput } from 'typescript';

export interface EmitFile {
	name: string;
	text: string;
}

export interface PromiseLanguageService {
	 getEmitOutput(fileName: string, emitOnlyDtsFiles?: boolean): Promise<EmitOutput>;
}

export interface TypeScriptWorker {
	(...uri: monaco.Uri[]): Promise<PromiseLanguageService>;
}
