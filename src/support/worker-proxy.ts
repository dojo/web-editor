/*
 * This module bootstraps the monaco-editor into a web worker, so that processing happens
 * in the background
 */

interface Window {
	MonacoEnvironment: any;
}

self.MonacoEnvironment = {
	baseUrl: '..'
};

importScripts('../vs/base/worker/workerMain.js');
