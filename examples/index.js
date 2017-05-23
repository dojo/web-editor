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
(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "@dojo/core/lang", "@dojo/widget-core/d", "@dojo/widget-core/mixins/Projector", "@dojo/widget-core/WidgetBase", "../Editor", "../project", "../Runner"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var lang_1 = require("@dojo/core/lang");
    var d_1 = require("@dojo/widget-core/d");
    var Projector_1 = require("@dojo/widget-core/mixins/Projector");
    var WidgetBase_1 = require("@dojo/widget-core/WidgetBase");
    var Editor_1 = require("../Editor");
    var project_1 = require("../project");
    var Runner_1 = require("../Runner");
    /* path to the project directory */
    var PROJECT_DIRECTORY = '../projects/';
    /**
     * An example application widget that incorporates both the Editor and Runner widgets into a simplistic UI
     */
    var App = (function (_super) {
        __extends(App, _super);
        function App() {
            var _this = _super !== null && _super.apply(this, arguments) || this;
            _this._compiling = false;
            _this._editorFilename = '';
            _this._projectValue = 'dojo2-todo-mvc.project.json';
            return _this;
        }
        /**
         * Returns a set of virtual DOM nodes that are the options for the file select
         */
        App.prototype._getFileOptions = function () {
            return project_1.default.getFileNames()
                .sort(function (a, b) { return a < b ? -1 : 1; })
                .map(function (filename) {
                return d_1.v('option', { value: filename }, [filename]);
            });
        };
        /**
         * Handle when the file changes in the dropdown
         * @param e The DOM `onchange` event
         */
        App.prototype._onchangeFile = function (e) {
            e.preventDefault();
            var select = e.target;
            this._editorFilename = select.value;
            this.invalidate();
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
            var fileSelect = null;
            /* If the project is loaded, then we will render a UI which allows selection of the file to edit and a button to run the project */
            if (isProjectLoaded) {
                fileSelect = d_1.v('div', { key: 'fileSelect' }, [
                    d_1.v('div', [
                        d_1.v('label', { for: 'select-file' }, ['File to display:']),
                        d_1.v('select', { name: 'select-file', id: 'select-file', onchange: this._onchangeFile }, this._getFileOptions())
                    ]),
                    d_1.v('div', [
                        d_1.v('button', { type: 'button', name: 'run', id: 'run', onclick: this._onclickRun, disabled: this._compiling ? true : false }, ['Run'])
                    ])
                ]);
            }
            var runnerProperties = lang_1.assign({}, this._program, { key: 'runner', onRun: this._onRun });
            return d_1.v('div', [
                projectLoad,
                fileSelect,
                d_1.v('div', {
                    classes: {
                        wrap: true
                    },
                    key: 'wrap'
                }, [
                    d_1.w(Editor_1.default, { filename: this._editorFilename, key: 'editor' }),
                    d_1.w(Runner_1.default, runnerProperties)
                ])
            ]);
        };
        return App;
    }(WidgetBase_1.default));
    /* Mixin a projector to the App and create an instance */
    var projector = new (Projector_1.default(App))();
    /* Start the projector and append it to the document.body */
    projector.append();
});
//# sourceMappingURL=index.js.map