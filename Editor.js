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
        define(["require", "exports", "@dojo/core/Destroyable", "@dojo/core/lang", "@dojo/core/util", "./project"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var Destroyable_1 = require("@dojo/core/Destroyable");
    var lang_1 = require("@dojo/core/lang");
    var util_1 = require("@dojo/core/util");
    var project_1 = require("./project");
    /**
     * A class which is a simple abstraction of the `monaco-editor` editor
     */
    var Editor = (function (_super) {
        __extends(Editor, _super);
        /**
         * A class which is a simple abstraction of the `monaco-editor` editor
         * @param element The root HTML element to attach the editor to
         */
        function Editor(element, options) {
            var _this = _super.call(this) || this;
            _this._onDidChangeModelContent = function () {
                project_1.default.setFileDirty(_this._currentFile);
            };
            _this._editor = monaco.editor.create(element, options);
            var didChangeHandle = _this._editor.onDidChangeModelContent(util_1.debounce(_this._onDidChangeModelContent, 1000));
            _this.own(lang_1.createHandle(function () {
                _this._editor.dispose();
                didChangeHandle.dispose();
            }));
            return _this;
        }
        /**
         * Display a file in the editor from the currently loaded project
         * @param model The model to display
         */
        Editor.prototype.display = function (filename) {
            if (!project_1.default.includes(filename)) {
                throw new Error("File \"" + filename + "\" is not part of the project.");
            }
            this._currentFile = filename;
            this._editor.setModel(project_1.default.getFileModel(filename));
        };
        return Editor;
    }(Destroyable_1.default));
    exports.default = Editor;
});
//# sourceMappingURL=Editor.js.map