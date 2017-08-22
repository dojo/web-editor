/*
 * This module bootstraps the monaco-editor into a web worker, so that processing happens
 * in the background
 */

interface Window {
	MonacoEnvironment: any;
}
declare const importScripts: (mid: string) => void;

self.MonacoEnvironment = {
	baseUrl: '..'
};
importScripts('../vs/base/worker/workerMain.js');
