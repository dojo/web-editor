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
        define(["require", "exports", "@dojo/shim/array", "@dojo/shim/Set", "@dojo/widget-core/d", "@dojo/widget-core/mixins/Projector", "@dojo/widget-core/WidgetBase", "../project", "../Workbench", "../support/editorThemes", "../support/icons", "../themes/dark/theme"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var array_1 = require("@dojo/shim/array");
    var Set_1 = require("@dojo/shim/Set");
    var d_1 = require("@dojo/widget-core/d");
    var Projector_1 = require("@dojo/widget-core/mixins/Projector");
    var WidgetBase_1 = require("@dojo/widget-core/WidgetBase");
    var project_1 = require("../project");
    var Workbench_1 = require("../Workbench");
    var editorThemes_1 = require("../support/editorThemes");
    var icons_1 = require("../support/icons");
    var theme_1 = require("../themes/dark/theme");
    /* path to the project directory */
    var PROJECTS_PATH = '../projects/';
    var EDITOR_THEME = '../data/editor-dark.json';
    var iconsSourcePath = '../extensions/vscode-material-icon-theme/out/src/material-icons.json';
    var icons;
    /**
     * An example application widget that incorporates both the Editor and Runner widgets into a simplistic UI
     */
    var App = /** @class */ (function (_super) {
        __extends(App, _super);
        function App() {
            var _this = _super !== null && _super.apply(this, arguments) || this;
            _this._compiling = false;
            _this._editorFilename = '';
            _this._emptyModel = monaco.editor.createModel('');
            _this._openFiles = new Set_1.default();
            _this._projectDirty = true;
            _this._projectValue = '005-initial.project.json';
            return _this;
        }
        /**
         * Handle when the project name changes in the dropdown
         * @param e The DOM `onchange` event
         */
        App.prototype._onchangeProject = function (e) {
            e.preventDefault();
            var select = e.target;
            this._projectValue = select.value;
        };
        /**
         * Handle when the on project load button is clicked
         * @param e The DOM `onclick` event
         */
        App.prototype._onclickLoad = function (e) {
            var _this = this;
            e.preventDefault();
            console.log("Loading project \"" + this._projectValue + "\"...");
            project_1.default.load(PROJECTS_PATH + this._projectValue)
                .then(function () {
                console.log('Project loaded');
                _this.invalidate();
            }, function (err) {
                console.error(err);
            });
        };
        App.prototype._onFileClose = function (filename) {
            var _openFiles = this._openFiles;
            _openFiles.delete(filename);
            if (this._editorFilename === filename) {
                if (!_openFiles.size) {
                    this._editorFilename = '';
                }
                else {
                    this._editorFilename = _openFiles.values().next().value;
                }
            }
            this.invalidate();
        };
        App.prototype._onFileOpen = function (filename) {
            if (project_1.default.isLoaded() && project_1.default.includes(filename)) {
                this._editorFilename = filename;
                this._openFiles.add(filename);
                this.invalidate();
            }
        };
        App.prototype._onFileSelect = function (filename) {
            this._editorFilename = filename;
            this.invalidate();
        };
        App.prototype._onDirty = function () {
            this._projectDirty = true;
            this.invalidate();
        };
        App.prototype._onRun = function () {
            this._compiling = false;
            this.invalidate();
        };
        /**
         * Handle when the on project run button is clicked
         */
        App.prototype._onRunClick = function () {
            return __awaiter(this, void 0, void 0, function () {
                var program, err_1;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            if (this._compiling || !project_1.default.isLoaded() || !this._projectDirty) {
                                return [2 /*return*/];
                            }
                            console.log('Compiling project...');
                            this._compiling = true;
                            this.invalidate(); /* this will update the UI so "Run" is disabled */
                            _a.label = 1;
                        case 1:
                            _a.trys.push([1, 3, , 4]);
                            return [4 /*yield*/, project_1.default.getProgram()];
                        case 2:
                            program = _a.sent();
                            this._program = program;
                            this._projectDirty = false;
                            this.invalidate(); /* this will cause the properties to the runner to change, starting the run process */
                            return [3 /*break*/, 4];
                        case 3:
                            err_1 = _a.sent();
                            console.error(err_1);
                            return [3 /*break*/, 4];
                        case 4: return [2 /*return*/];
                    }
                });
            });
        };
        App.prototype.render = function () {
            var isProjectLoaded = project_1.default.isLoaded();
            var filename = this._editorFilename;
            /* A UI to select a project and provide a button to load it */
            var projectLoad = d_1.v('div', { key: 'projectLoad' }, [
                d_1.v('label', { for: 'project' }, ['Project to load:']),
                d_1.v('select', { type: 'text', name: 'project', id: 'project', onchange: this._onchangeProject, disabled: isProjectLoaded ? true : false }, [
                    d_1.v('option', { value: '005-initial.project.json', selected: true }, ['Form widgets tutorial - initial']),
                    d_1.v('option', { value: 'dojo-test-app.project.json' }, ['Dojo2 Hello World']),
                    d_1.v('option', { value: 'dojo2-todo-mvc.project.json' }, ['Dojo2 Todo MVC']),
                    d_1.v('option', { value: 'dojo2-todo-mvc-tsx.project.json' }, ['Dojo 2 JSX Todo MVC']),
                    d_1.v('option', { value: 'dojo2-todo-mvc-kitchensink.project.json' }, ['Dojo2 Kitchensink Todo MVC'])
                ]),
                d_1.v('button', { type: 'button', name: 'load-project', id: 'load-project', onclick: this._onclickLoad, disabled: isProjectLoaded ? true : false }, ['Load'])
            ]);
            var model = filename && isProjectLoaded && project_1.default.includes(filename) ? project_1.default.getFileModel(filename) : this._emptyModel;
            return d_1.v('div', {
                classes: { app: true }
            }, [
                projectLoad,
                d_1.w(Workbench_1.default, {
                    filename: filename,
                    files: isProjectLoaded ? project_1.default.getFileNames() : undefined,
                    icons: icons,
                    iconsSourcePath: iconsSourcePath,
                    model: model,
                    openFiles: array_1.from(this._openFiles),
                    program: this._program,
                    runnable: !this._compiling && isProjectLoaded && this._projectDirty,
                    theme: theme_1.default,
                    onFileClose: this._onFileClose,
                    onFileOpen: this._onFileOpen,
                    onFileSelect: this._onFileSelect,
                    onDirty: this._onDirty,
                    onRun: this._onRun,
                    onRunClick: this._onRunClick
                })
            ]);
        };
        return App;
    }(WidgetBase_1.default));
    /* Mixin a projector to the App and create an instance */
    var projector = new (Projector_1.default(App))();
    (function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, editorThemes_1.load(EDITOR_THEME)];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, icons_1.load(iconsSourcePath)];
                    case 2:
                        icons = _a.sent();
                        /* Start the projector and append it to the document.body */
                        projector.append();
                        return [2 /*return*/];
                }
            });
        });
    })();
});
//# sourceMappingURL=index.js.map