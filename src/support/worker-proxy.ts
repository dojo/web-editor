/*
 * This module bootstraps the monaco-editor into a web worker, so that processing happens
 * in the background
 */

interface Window {
	MonacoEnvironment: any;
}

self.MonacoEnvironment = {
	baseUrl: '../../../node_modules/monaco-editor/min/'
};
(self as any).importScripts('../../../node_modules/monaco-editor/min/vs/base/worker/workerMain.js');
