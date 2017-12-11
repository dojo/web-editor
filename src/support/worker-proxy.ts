/*
 * This module bootstraps the monaco-editor into a web worker, so that processing happens
 * in the background
 */

// declare function importScripts(script: string): void;

interface Window {
	MonacoEnvironment: any;
}

self.MonacoEnvironment = {
	baseUrl: '..'
};

importScripts('../vs/base/worker/workerMain.js');
