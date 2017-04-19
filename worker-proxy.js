/*
 * This module bootstraps the monaco-editor into a web worker, so that processing happens
 * in the background
 */
self.MonacoEnvironment = {
    baseUrl: './node_modules/monaco-editor/min/'
};
importScripts('./node_modules/monaco-editor/min/vs/base/worker/workerMain.js');
//# sourceMappingURL=worker-proxy.js.map