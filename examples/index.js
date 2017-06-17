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
        define(["require", "exports", "@dojo/core/lang", "@dojo/shim/array", "@dojo/widget-core/d", "@dojo/widget-core/mixins/Projector", "@dojo/widget-core/WidgetBase", "../Editor", "../FileBar", "../IconCss", "../TreePane", "../styles/treepane.m.css", "../project", "../Runner", "../support/icons", "../support/themes", "../themes/dark/theme"], factory);
    }
})(function (require, exports) {
    "use strict";
    var _this = this;
    Object.defineProperty(exports, "__esModule", { value: true });
    var lang_1 = require("@dojo/core/lang");
    var array_1 = require("@dojo/shim/array");
    var d_1 = require("@dojo/widget-core/d");
    var Projector_1 = require("@dojo/widget-core/mixins/Projector");
    var WidgetBase_1 = require("@dojo/widget-core/WidgetBase");
    var Editor_1 = require("../Editor");
    var FileBar_1 = require("../FileBar");
    var IconCss_1 = require("../IconCss");
    var TreePane_1 = require("../TreePane");
    var css = require("../styles/treepane.m.css");
    var project_1 = require("../project");
    var Runner_1 = require("../Runner");
    var icons_1 = require("../support/icons");
    var themes_1 = require("../support/themes");
    var theme_1 = require("../themes/dark/theme");
    /* path to the project directory */
    var PROJECT_DIRECTORY = '../../../projects/';
    var monacoTheme;
    var icons;
    var sourcePath = '../../extensions/vscode-material-icon-theme/out/src/material-icons.json';
    function addFile(root, filename) {
        if (!root) {
            root = {
                children: [],
                id: '',
                label: '',
                title: ''
            };
        }
        var endsWithPathMarker = /[\/\\]$/.test(filename);
        var parts = filename.split(/[\/\\]/);
        var deliminator = filename.split('/').length === parts.length ? '/' : '\\';
        var idParts = [];
        if (parts[0] === '.') {
            idParts.push(parts.shift());
            if (root.id === '') {
                root = {
                    children: [],
                    id: '.',
                    label: '.',
                    title: '.'
                };
            }
        }
        var parent = root;
        var _loop_1 = function () {
            var currentPart = parts[0];
            if (!parent.children) {
                parent.children = [];
            }
            var item = array_1.find(parent.children, function (child) { return child.label === currentPart; });
            if (!item) {
                item = {
                    id: idParts.concat(currentPart).join(deliminator),
                    label: currentPart,
                    title: idParts.concat(currentPart).join(deliminator)
                };
                parent.children.push(item);
            }
            parent = item;
            idParts.push(parts.shift());
        };
        while (parts.length) {
            _loop_1();
        }
        if (endsWithPathMarker && !parent.children) {
            parent.children = [];
        }
        return root;
    }
    /**
     * An example application widget that incorporates both the Editor and Runner widgets into a simplistic UI
     */
    var App = (function (_super) {
        __extends(App, _super);
        function App() {
            var _this = _super !== null && _super.apply(this, arguments) || this;
            _this._activeFileIndex = 0;
            _this._compiling = false;
            _this._editorFilename = '';
            _this._expanded = ['/', '/src'];
            _this._projectValue = 'dojo2-todo-mvc.project.json';
            _this._openFiles = [];
            return _this;
        }
        App.prototype._getTreeItems = function () {
            var files = project_1.default.getFileNames();
            return files
                .sort(function (a, b) { return a < b ? -1 : 1; })
                .reduce(function (previous, current) { return addFile(previous, current); }, {
                id: '',
                label: '',
                title: ''
            });
        };
        App.prototype._getActiveFile = function () {
            return this._activeFileIndex;
        };
        App.prototype._getFileItems = function () {
            return this._openFiles.map(function (filename) {
                return {
                    closeable: true,
                    key: filename,
                    label: filename.split(/[\/\\]/).pop()
                };
            });
        };
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
            project_1.default.load(PROJECT_DIRECTORY + this._projectValue)
                .then(function () {
                console.log('Project loaded');
                _this.invalidate();
            }, function (err) {
                console.error(err);
            });
        };
        /**
         * Handle when the on project run button is clicked
         * @param e The DOM `onclick` event
         */
        App.prototype._onclickRun = function (e) {
            var _this = this;
            e.preventDefault();
            console.log('Compiling project...');
            this._compiling = true;
            this.invalidate(); /* this will update the UI so "Run" is disabled */
            project_1.default.getProgram()
                .then(function (program) {
                _this._program = program;
                _this.invalidate(); /* this will cause the properties to the runner to change, starting the run process */
            }, function (err) {
                console.error(err);
            });
        };
        App.prototype._onItemOpen = function (id) {
            this._selected = id;
            if (project_1.default.isLoaded() && project_1.default.includes(id)) {
                if (array_1.includes(this._openFiles, id)) {
                    this._activeFileIndex = this._openFiles.indexOf(id);
                }
                else {
                    this._activeFileIndex = this._openFiles.push(id) - 1;
                }
                this._editorFilename = id;
            }
            this.invalidate();
        };
        App.prototype._onItemSelect = function (id) {
            this._selected = id;
            this.invalidate();
        };
        App.prototype._onItemToggle = function (id) {
            if (array_1.includes(this._expanded, id)) {
                this._expanded.splice(this._expanded.indexOf(id), 1);
            }
            else {
                this._expanded.push(id);
            }
            this.invalidate();
        };
        App.prototype._onRequestTabClose = function (file, index) {
            this._openFiles.splice(index, 1);
            this._activeFileIndex = this._activeFileIndex >= this._openFiles.length ?
                this._openFiles.length - 1 : this._activeFileIndex === index ?
                index : this._activeFileIndex ?
                this._activeFileIndex - 1 : 0;
            this._editorFilename = this._openFiles[this._activeFileIndex];
            this.invalidate();
        };
        App.prototype._onRequestTabChange = function (file, index) {
            this._selected = this._editorFilename = this._openFiles[this._activeFileIndex = index];
            this.invalidate();
        };
        /**
         * Handles when the Runner widget finishes running the project
         */
        App.prototype._onRun = function () {
            this._compiling = false;
            this.invalidate(); /* this will enable the "Run" button in the UI */
        };
        App.prototype.render = function () {
            var isProjectLoaded = project_1.default.isLoaded();
            /* A UI to select a project and provide a button to load it */
            var projectLoad = d_1.v('div', { key: 'projectLoad' }, [
                d_1.v('label', { for: 'project' }, ['Project to load:']),
                d_1.v('select', { type: 'text', name: 'project', id: 'project', onchange: this._onchangeProject, disabled: isProjectLoaded ? true : false }, [
                    d_1.v('option', { value: 'dojo-test-app.project.json' }, ['Dojo2 Hello World']),
                    d_1.v('option', { value: 'dojo2-todo-mvc.project.json', selected: true }, ['Dojo2 Todo MVC']),
                    d_1.v('option', { value: 'dojo2-todo-mvc-kitchensink.project.json' }, ['Dojo2 Kitchensink Todo MVC'])
                ]),
                d_1.v('button', { type: 'button', name: 'load-project', id: 'load-project', onclick: this._onclickLoad, disabled: isProjectLoaded ? true : false }, ['Load'])
            ]);
            var projectRun = null;
            /* If the project is loaded, then we will render a UI which allows selection of the file to edit and a button to run the project */
            if (isProjectLoaded) {
                projectRun = d_1.v('div', { key: 'projectRun' }, [
                    d_1.v('button', { type: 'button', name: 'run', id: 'run', onclick: this._onclickRun, disabled: this._compiling ? true : false }, ['Run'])
                ]);
            }
            var runnerProperties = lang_1.assign({}, this._program, { key: 'runner', onRun: this._onRun, theme: theme_1.default });
            return d_1.v('div', {
                classes: {
                    'app': true
                }
            }, [
                d_1.w(IconCss_1.default, {
                    baseClass: css.labelFixed,
                    icons: icons,
                    key: 'iconcss',
                    sourcePath: sourcePath
                }),
                projectLoad,
                projectRun,
                d_1.v('div', {
                    classes: {
                        wrap: true
                    },
                    key: 'wrap'
                }, [
                    d_1.v('div', {
                        styles: { flex: '1' }
                    }, [d_1.w(TreePane_1.default, {
                            expanded: this._expanded.slice(),
                            icons: icons,
                            key: 'treepane',
                            selected: this._selected,
                            sourcePath: sourcePath,
                            root: isProjectLoaded ? this._getTreeItems() : undefined,
                            onItemOpen: this._onItemOpen,
                            onItemSelect: this._onItemSelect,
                            onItemToggle: this._onItemToggle,
                            theme: theme_1.default
                        })]),
                    d_1.v('div', {
                        styles: { flex: '1', margin: '0 0.5em' }
                    }, [
                        this._openFiles.length ? d_1.w(FileBar_1.default, {
                            activeIndex: this._getActiveFile(),
                            files: this._getFileItems(),
                            key: 'filebar',
                            theme: theme_1.default,
                            onRequestTabClose: this._onRequestTabClose,
                            onRequestTabChange: this._onRequestTabChange
                        }) : null,
                        d_1.w(Editor_1.default, {
                            filename: this._editorFilename,
                            key: 'editor',
                            options: { theme: monacoTheme },
                            theme: theme_1.default
                        })
                    ]),
                    d_1.w(Runner_1.default, runnerProperties)
                ])
            ]);
        };
        return App;
    }(WidgetBase_1.default));
    /* Mixin a projector to the App and create an instance */
    var projector = new (Projector_1.default(App))();
    (function () { return __awaiter(_this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, themes_1.load('../themes/editor-dark.json')];
                case 1:
                    monacoTheme = _a.sent();
                    return [4 /*yield*/, icons_1.load(sourcePath)];
                case 2:
                    icons = _a.sent();
                    /* Start the projector and append it to the document.body */
                    projector.append();
                    return [2 /*return*/];
            }
        });
    }); })();
});
//# sourceMappingURL=index.js.map