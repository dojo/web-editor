var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = y[op[0] & 2 ? "return" : op[0] ? "throw" : "next"]) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [0, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "vs/editor/editor.main", "@dojo/core/Evented", "@dojo/core/lang", "@dojo/core/request", "@dojo/shim/array", "@dojo/shim/WeakMap", "./support/css", "./support/json", "./support/providers/xhr"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    require("vs/editor/editor.main"); /* imported for side-effects */
    var Evented_1 = require("@dojo/core/Evented");
    var lang_1 = require("@dojo/core/lang");
    var request_1 = require("@dojo/core/request");
    var array_1 = require("@dojo/shim/array");
    var WeakMap_1 = require("@dojo/shim/WeakMap");
    var css_1 = require("./support/css");
    var json_1 = require("./support/json");
    var xhr_1 = require("./support/providers/xhr");
    /* Changes to a provider that doesn't have issue https://github.com/dojo/core/issues/328 */
    request_1.default.setDefaultProvider(xhr_1.default);
    /**
     * Flatten a TypeScript diagnostic message
     *
     * Ported from `typescript` due to the fact that this is not exposed via `monaco-editor`
     *
     * @param messageText The text of the diagnostic message
     * @param newLine The newline character to use when flattening
     */
    function flattenDiagnosticMessageText(messageText, newLine) {
        if (typeof messageText === 'string') {
            return messageText;
        }
        else {
            var diagnosticChain = messageText;
            var result = '';
            var indent = 0;
            while (diagnosticChain) {
                if (indent) {
                    result += newLine;
                    for (var i = 0; i < indent; i++) {
                        result += '  ';
                    }
                }
                result += diagnosticChain.messageText;
                indent++;
                diagnosticChain = diagnosticChain.next;
            }
            return result;
        }
    }
    /**
     * Create a monaco-editor model for the specified project file
     * @param param0 The project file to create the model from
     */
    function createMonacoModel(_a) {
        var filename = _a.name, text = _a.text, type = _a.type;
        return monaco.editor.createModel(text, getLanguageFromType(type), monaco.Uri.file(filename));
    }
    /**
     * Convert a `ProjectFileType` to a monaco-editor language
     * @param type The type to get a monaco-editor language for
     */
    function getLanguageFromType(type) {
        switch (type) {
            case 2 /* Definition */:
            case 1 /* TypeScript */:
            case 3 /* Lib */:
                return 'typescript';
            case 6 /* HTML */:
                return 'html';
            case 4 /* JavaScript */:
                return 'javascript';
            case 7 /* Markdown */:
                return 'markdown';
            case 5 /* CSS */:
                return 'css';
            case 10 /* SourceMap */:
            case 8 /* JSON */:
                return 'json';
            case 11 /* PlainText */:
                return 'plaintext';
            case 9 /* XML */:
                return 'xml';
            default:
                return 'unknown';
        }
    }
    var ScriptTarget = monaco.languages.typescript.ScriptTarget;
    function getScriptTarget(type) {
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
    var Project = (function (_super) {
        __extends(Project, _super);
        function Project() {
            var _this = _super !== null && _super.apply(this, arguments) || this;
            /**
             * A map of meta data related to project files
             */
            _this._fileMap = new WeakMap_1.default();
            return _this;
        }
        /**
         * Check if there are any emit errors for a given file
         * @param services The language services to check
         * @param filename The reference filename
         */
        Project.prototype._checkEmitErrors = function (services, filename) {
            return __awaiter(this, void 0, void 0, function () {
                var diagnostics, _a, _b, _c;
                return __generator(this, function (_d) {
                    switch (_d.label) {
                        case 0: return [4 /*yield*/, services.getCompilerOptionsDiagnostics()];
                        case 1:
                            _b = (_a = (_d.sent())).concat;
                            return [4 /*yield*/, services.getSemanticDiagnostics(filename)];
                        case 2:
                            _c = [_d.sent()];
                            return [4 /*yield*/, services.getSyntacticDiagnostics(filename)];
                        case 3:
                            diagnostics = _b.apply(_a, _c.concat([_d.sent()]));
                            diagnostics.forEach(function (diagnostic) {
                                var message = flattenDiagnosticMessageText(diagnostic.messageText, '\n');
                                if (diagnostic.file) {
                                    var _a = diagnostic.file.getLineAndCharacterOfPosition(diagnostic.start), line = _a.line, character = _a.character;
                                    console.warn("Error " + diagnostic.file.name + " (" + (line + 1) + "," + (character + 1) + "): " + message);
                                }
                                else {
                                    console.warn("Error: " + message);
                                }
                            });
                            return [2 /*return*/];
                    }
                });
            });
        };
        /**
         * An async function which resolves with the parsed text of the project bundle
         * @param filename The filename to load the bundle from
         */
        Project.prototype._loadBundle = function (filename) {
            return __awaiter(this, void 0, void 0, function () {
                var _a;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            _a = this;
                            return [4 /*yield*/, request_1.default(filename)];
                        case 1: return [4 /*yield*/, (_b.sent()).json()];
                        case 2:
                            _a._project = _b.sent();
                            return [2 /*return*/];
                    }
                });
            });
        };
        /**
         * Retrieve the project file meta data being tracked by the project
         * @param file The project file
         */
        Project.prototype._getProjectFileData = function (file) {
            if (!this._fileMap.has(file)) {
                this._fileMap.set(file, {});
            }
            return this._fileMap.get(file);
        };
        /**
         * The the environment files in the monaco-editor environment.  These are the "non-editable" files which support the
         * project and are usually additional type definitions that the project depends upon.
         */
        Project.prototype._setEnvironmentFiles = function () {
            this._project.environmentFiles.forEach(function (_a) {
                var filename = _a.name, text = _a.text, type = _a.type;
                monaco.languages.typescript.typescriptDefaults.addExtraLib(text, (type === 3 /* Lib */ ? '' : 'file:///') + filename);
            });
        };
        /**
         * Ensure that any TypeScript project fies are part of the environment, so that TypeScript files can be edited with
         * the full context of the project.
         */
        Project.prototype._setProjectFiles = function () {
            var _this = this;
            this._project.files.forEach(function (file) {
                var filename = file.name, text = file.text, type = file.type;
                if (type === 1 /* TypeScript */ || type === 2 /* Definition */) {
                    var fileData = _this._getProjectFileData(file);
                    fileData.extraLibHandle = monaco.languages.typescript.typescriptDefaults.addExtraLib(text, 'file:///' + filename);
                }
            });
        };
        /**
         * Set the compiler options for the TypeScript environment based on what is provided by the project bundle, combined
         * with additional settings that are required for use in the web-editor.
         */
        Project.prototype._setTypeScriptEnvironment = function () {
            var _a = this._project.tsconfig.compilerOptions, compilerOptions = _a === void 0 ? {} : _a;
            var options = {};
            /* copied from tsconfig.json */
            var experimentalDecorators = compilerOptions.experimentalDecorators, lib = compilerOptions.lib, noImplicitAny = compilerOptions.noImplicitAny, noImplicitThis = compilerOptions.noImplicitThis, noImplicitReturns = compilerOptions.noImplicitReturns, noLib = compilerOptions.noLib, noUnusedLocals = compilerOptions.noUnusedLocals, noUnusedParameters = compilerOptions.noUnusedParameters, strictNullChecks = compilerOptions.strictNullChecks, target = compilerOptions.target, types = compilerOptions.types;
            lang_1.assign(options, {
                experimentalDecorators: experimentalDecorators,
                lib: lib,
                noImplicitAny: noImplicitAny,
                noImplicitThis: noImplicitThis,
                noImplicitReturns: noImplicitReturns,
                noLib: noLib,
                noUnusedLocals: noUnusedLocals,
                noUnusedParameters: noUnusedParameters,
                strictNullChecks: strictNullChecks,
                target: getScriptTarget(target),
                types: types
            });
            /* asserted for web editing */
            lang_1.assign(options, {
                allowNonTsExtensions: true,
                inlineSources: true,
                module: monaco.languages.typescript.ModuleKind.AMD,
                moduleResolution: monaco.languages.typescript.ModuleResolutionKind.NodeJs,
                noEmitHelpers: true,
                sourceMap: true /* we will generate sourcemaps and remap them when we add them to the page */
            });
            monaco.languages.typescript.typescriptDefaults.setCompilerOptions(options);
        };
        /**
         * Flush any changes that have come from the editor back into the project files.
         */
        Project.prototype._updateBundle = function () {
            var _this = this;
            if (!this._project) {
                return;
            }
            this._project.files
                .filter(function (_a) {
                var name = _a.name;
                return _this.isFileDirty(name);
            })
                .forEach(function (file) {
                file.text = _this.getFileModel(file.name).getValue();
                _this.setFileDirty(file.name, true);
            });
        };
        /**
         * Update a CSS Module by updating its definition file and adding it to the environment.
         * @param cssModuleFile The CSS Module to update
         */
        Project.prototype._updateCssModule = function (cssModuleFile) {
            return __awaiter(this, void 0, void 0, function () {
                var definitionFile, existingDefinition, name, text, fileData;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            cssModuleFile.text = this.getFileText(cssModuleFile.name);
                            return [4 /*yield*/, css_1.getDefinitions(cssModuleFile)];
                        case 1:
                            definitionFile = (_a.sent())[0];
                            existingDefinition = array_1.find(this._project.files, (function (_a) {
                                var name = _a.name;
                                return name === definitionFile.name;
                            }));
                            if (existingDefinition) {
                                existingDefinition.text = definitionFile.text;
                                definitionFile = existingDefinition;
                            }
                            else {
                                this._project.files.push(definitionFile);
                            }
                            name = definitionFile.name, text = definitionFile.text;
                            fileData = this._getProjectFileData(definitionFile);
                            if (fileData.extraLibHandle) {
                                fileData.extraLibHandle.dispose();
                            }
                            fileData.extraLibHandle = monaco.languages.typescript.typescriptDefaults.addExtraLib(text, 'file:///' + name);
                            return [2 /*return*/];
                    }
                });
            });
        };
        /**
         * Take the currently loaded project and emit it
         */
        Project.prototype.emit = function () {
            return __awaiter(this, void 0, void 0, function () {
                var _this = this;
                var typescriptFileUris, _a, worker, services, output, cssFiles, jsonFiles, otherFiles;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            if (!this._project) {
                                throw new Error('Project not loaded.');
                            }
                            typescriptFileUris = this._project.files
                                .filter(function (_a) {
                                var type = _a.type;
                                return type === 2 /* Definition */ || type === 1 /* TypeScript */;
                            })
                                .map(function (_a) {
                                var name = _a.name;
                                return _this.getFileModel(name).uri;
                            });
                            if (!!this._worker) return [3 /*break*/, 2];
                            _a = this;
                            return [4 /*yield*/, monaco.languages.typescript.getTypeScriptWorker()];
                        case 1:
                            _a._worker = _b.sent();
                            _b.label = 2;
                        case 2:
                            worker = this._worker;
                            return [4 /*yield*/, worker.apply(void 0, typescriptFileUris)];
                        case 3:
                            services = _b.sent();
                            return [4 /*yield*/, Promise.all(typescriptFileUris.map(function (file) { return __awaiter(_this, void 0, void 0, function () {
                                    var filename, emitOutput;
                                    return __generator(this, function (_a) {
                                        switch (_a.label) {
                                            case 0:
                                                filename = file.toString();
                                                return [4 /*yield*/, services.getEmitOutput(filename)];
                                            case 1:
                                                emitOutput = _a.sent();
                                                return [4 /*yield*/, this._checkEmitErrors(services, filename)];
                                            case 2:
                                                _a.sent();
                                                return [2 /*return*/, emitOutput];
                                        }
                                    });
                                }); }))];
                        case 4:
                            output = _b.sent();
                            return [4 /*yield*/, css_1.getEmit.apply(void 0, this._project.files /* add css modules */
                                    .filter(function (_a) {
                                    var type = _a.type;
                                    return type === 5 /* CSS */;
                                })
                                    .map(function (_a) {
                                    var name = _a.name, type = _a.type;
                                    return { model: _this.getFileModel(name), type: type };
                                })
                                    .map(function (_a) {
                                    var model = _a.model, type = _a.type;
                                    return { name: model.uri.fsPath.replace(/^\/\.\//, ''), text: model.getValue(), type: type };
                                }))];
                        case 5:
                            cssFiles = _b.sent();
                            jsonFiles = json_1.getEmit.apply(void 0, this._project.files /* add json files as a module */
                                .filter(function (_a) {
                                var type = _a.type;
                                return type === 8 /* JSON */;
                            })
                                .map(function (_a) {
                                var name = _a.name, type = _a.type;
                                return { model: _this.getFileModel(name), type: type };
                            })
                                .map(function (_a) {
                                var model = _a.model, type = _a.type;
                                return { name: model.uri.fsPath.replace(/^\/\.\//, ''), text: model.getValue(), type: type };
                            }));
                            otherFiles = this._project.files /* add on other project files */
                                .filter(function (_a) {
                                var type = _a.type;
                                return type !== 2 /* Definition */ && type !== 1 /* TypeScript */ && type !== 5 /* CSS */ && type !== 8 /* JSON */;
                            })
                                .map(function (_a) {
                                var name = _a.name, type = _a.type;
                                return { model: _this.getFileModel(name), type: type };
                            })
                                .map(function (_a) {
                                var model = _a.model, type = _a.type;
                                return { name: model.uri.fsPath.replace(/^\/\.\//, ''), text: model.getValue(), type: type };
                            });
                            return [2 /*return*/, output
                                    .reduce(function (previous, output) { return previous.concat(output.outputFiles); }, [])
                                    .map(function (_a) {
                                    var text = _a.text, name = _a.name;
                                    return {
                                        text: text,
                                        name: name.replace('file:///', ''),
                                        type: /^(.*\.(?!map$))?[^.]*$/.test(name) ? 4 /* JavaScript */ : 10 /* SourceMap */
                                    };
                                })
                                    .concat(cssFiles, jsonFiles, otherFiles)];
                    }
                });
            });
        };
        /**
         * Return the currently loaded project bundle.
         */
        Project.prototype.get = function () {
            this._updateBundle();
            return this._project;
        };
        /**
         * The package dependencies for this project
         * @param includeDev If `true` it will include development dependencies.  Defaults to `false`.
         */
        Project.prototype.getDependencies = function (includeDev) {
            if (includeDev === void 0) { includeDev = false; }
            if (!this._project) {
                throw new Error('Project not loaded.');
            }
            return lang_1.assign({}, this._project.dependencies.production, includeDev ? this._project.dependencies.development : undefined);
        };
        /**
         * Retrieve a project file based on the file name from the project bundle, or return `undefined` if the file is not part of
         * the project.
         * @param filename The file name of the project file
         */
        Project.prototype.getFile = function (filename) {
            if (!this._project) {
                throw new Error('Project not loaded.');
            }
            return array_1.find(this._project.files, function (_a) {
                var name = _a.name;
                return name === filename;
            });
        };
        /**
         * Return an array of `ProjectFile` objects which are the files associated with the project.  By default it returns all of
         * the files, but to filer based on file type, pass additional arguments of the file types to filter on.
         * @param types Return only files that match these project file types
         */
        Project.prototype.getFiles = function () {
            var types = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                types[_i] = arguments[_i];
            }
            if (!this._project) {
                throw new Error('Project not loaded.');
            }
            var filenames = this._project.files.map(function (_a) {
                var name = _a.name;
                return name;
            });
            /* while sometimes, CSS Modules Definition files are included in a project bundle, and need to be part of the environment, they
             * shouldn't be editable and therefore we won't return them */
            return this._project.files
                .filter(function (_a) {
                var name = _a.name, type = _a.type;
                return !(type === 2 /* Definition */ && array_1.includes(filenames, name.replace(/\.d\.ts$/, ''))) && (types.length ? array_1.includes(types, type) : true);
            });
        };
        /**
         * Return a monaco-editor model for a specified file name.  Will throw if the filename is not part of the project.
         * @param filename The file name of the project file
         */
        Project.prototype.getFileModel = function (filename) {
            var file = this.getFile(filename);
            if (!file) {
                throw new Error("File \"" + filename + "\" is not part of the project.");
            }
            var fileData = this._getProjectFileData(file);
            if (!fileData.model) {
                fileData.model = createMonacoModel(file);
            }
            return fileData.model;
        };
        /**
         * Return an array of strings which are the names of the project files associated with the project.  By default it returns
         * all of the files, but to filter based on file type, pass additional arguments of the file types to filter on.
         * @param types Return only files that match these project file types
         */
        Project.prototype.getFileNames = function () {
            var types = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                types[_i] = arguments[_i];
            }
            return this.getFiles.apply(this, types).map(function (_a) {
                var name = _a.name;
                return name;
            });
        };
        /**
         * Retrieve the text of the file from the project
         * @param filename The file name of the project file
         */
        Project.prototype.getFileText = function (filename) {
            return this.getFileModel(filename).getValue();
        };
        /**
         * Retrieve the text for the index HTML that has been specified in the project
         */
        Project.prototype.getIndexHtml = function () {
            if (!this._project) {
                throw new Error('Project not loaded.');
            }
            return this.getFileText(this._project.index);
        };
        /**
         * Resolves with an object which represents the current program which can then be run in a browser
         */
        Project.prototype.getProgram = function () {
            return __awaiter(this, void 0, void 0, function () {
                var program, modules, css;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.emit()];
                        case 1:
                            program = _a.sent();
                            modules = program
                                .filter(function (_a) {
                                var type = _a.type;
                                return type === 4 /* JavaScript */ || type === 10 /* SourceMap */;
                            })
                                .reduce(function (map, _a) {
                                var name = _a.name, text = _a.text, type = _a.type;
                                var mid = name.replace(/\.js(?:\.map)?$/, '');
                                if (!(mid in map)) {
                                    map[mid] = { code: '', map: '' };
                                }
                                map[mid][type === 4 /* JavaScript */ ? 'code' : 'map'] = text;
                                return map;
                            }, {});
                            css = program
                                .filter(function (_a) {
                                var type = _a.type;
                                return type === 5 /* CSS */;
                            })
                                .map(function (_a) {
                                var name = _a.name, text = _a.text;
                                return { name: name, text: text };
                            });
                            return [2 /*return*/, {
                                    css: css,
                                    dependencies: this.getDependencies(),
                                    html: this.getIndexHtml(),
                                    modules: modules
                                }];
                    }
                });
            });
        };
        /**
         * Return `true` if the specified file name is part of the project, otherwise `false`.
         * @param filename The file name
         */
        Project.prototype.includes = function (filename) {
            return Boolean(this._project && array_1.includes(this.getFileNames(), filename));
        };
        /**
         * Determine if a file, by name is _dirty_ and has not had its contents updated in the project bundle once being edited
         * in the editor.
         * @param filename The file name
         */
        Project.prototype.isFileDirty = function (filename) {
            var file = this.getFile(filename);
            return Boolean(file && this._getProjectFileData(file).dirty);
        };
        /**
         * Returns `true` if the project is loaded, otherwise `false`
         */
        Project.prototype.isLoaded = function () {
            return Boolean(this._project);
        };
        /**
         * An async function which loads a project JSON bundle file and sets the monaco-editor environment to be
         * to edit the project.
         * @param filenameOrUrl The project file name or URL to load
         */
        Project.prototype.load = function (filenameOrUrl) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            if (this._project) {
                                throw new Error('Project is already loaded.');
                            }
                            return [4 /*yield*/, this._loadBundle(filenameOrUrl)];
                        case 1:
                            _a.sent();
                            this._setTypeScriptEnvironment();
                            this._setEnvironmentFiles();
                            this._setProjectFiles();
                            return [2 /*return*/];
                    }
                });
            });
        };
        /**
         * Set (or unset) the file _dirty_ flag on a project file
         * @param filename The file name
         * @param reset Set to `true` to unset the _dirty_ flag on the file
         */
        Project.prototype.setFileDirty = function (filename, reset) {
            return __awaiter(this, void 0, void 0, function () {
                var file;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            file = this.getFile(filename);
                            if (!file) {
                                throw new Error("File \"" + filename + "\" is not part of the project.");
                            }
                            if (!(file.type === 5 /* CSS */)) return [3 /*break*/, 2];
                            /* the functionality of this method negates setting the dirty flag, so we won't */
                            return [4 /*yield*/, this._updateCssModule(file)];
                        case 1:
                            /* the functionality of this method negates setting the dirty flag, so we won't */
                            _a.sent();
                            return [3 /*break*/, 3];
                        case 2:
                            this._getProjectFileData(file).dirty = !reset;
                            _a.label = 3;
                        case 3: return [2 /*return*/];
                    }
                });
            });
        };
        return Project;
    }(Evented_1.default));
    exports.Project = Project;
    /* create singleton instance of project for default export */
    var project = new Project();
    exports.default = project;
});
//# sourceMappingURL=project.js.map