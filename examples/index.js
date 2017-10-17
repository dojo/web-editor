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
        define(["require", "exports", "@dojo/widget-core/d", "@dojo/widget-core/mixins/Projector", "@dojo/widget-core/WidgetBase", "../project", "../Workbench", "../support/editorThemes", "../support/icons", "../themes/dark/theme"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
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
    var App = (function (_super) {
        __extends(App, _super);
        function App() {
            var _this = _super !== null && _super.apply(this, arguments) || this;
            _this._compiling = false;
            _this._editorFilename = '';
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
        App.prototype._onFileOpen = function (filename) {
            if (project_1.default.isLoaded() && project_1.default.includes(filename)) {
                this._editorFilename = filename;
            }
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
                    d_1.v('option', { value: '005-initial.project.json', selected: true }, ['Form widgets tutorial - initial']),
                    d_1.v('option', { value: 'dojo-test-app.project.json' }, ['Dojo2 Hello World']),
                    d_1.v('option', { value: 'dojo2-todo-mvc.project.json' }, ['Dojo2 Todo MVC']),
                    d_1.v('option', { value: 'dojo2-todo-mvc-tsx.project.json' }, ['Dojo 2 JSX Todo MVC']),
                    d_1.v('option', { value: 'dojo2-todo-mvc-kitchensink.project.json' }, ['Dojo2 Kitchensink Todo MVC'])
                ]),
                d_1.v('button', { type: 'button', name: 'load-project', id: 'load-project', onclick: this._onclickLoad, disabled: isProjectLoaded ? true : false }, ['Load'])
            ]);
            var fileSelect = null;
            /* If the project is loaded, then we will render a UI which allows selection of the file to edit and a button to run the project */
            if (isProjectLoaded) {
                fileSelect = d_1.v('div', { key: 'fileSelect' }, [
                    d_1.v('div', [
                        d_1.v('button', { type: 'button', name: 'run', id: 'run', onclick: this._onclickRun, disabled: this._compiling ? true : false }, ['Run'])
                    ])
                ]);
            }
            return d_1.v('div', {
                classes: { app: true }
            }, [
                projectLoad,
                fileSelect,
                d_1.w(Workbench_1.default, {
                    filename: this._editorFilename,
                    files: isProjectLoaded ? project_1.default.getFileNames() : undefined,
                    icons: icons,
                    iconsSourcePath: iconsSourcePath,
                    program: this._program,
                    theme: theme_1.default,
                    onFileOpen: this._onFileOpen,
                    onRun: this._onRun
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