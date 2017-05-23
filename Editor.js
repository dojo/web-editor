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
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "@dojo/core/global", "@dojo/core/lang", "@dojo/core/queue", "@dojo/core/util", "@dojo/widget-core/d", "@dojo/widget-core/WidgetBase", "@dojo/widget-core/mixins/Themeable", "./project", "./styles/editor.m.css"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var global_1 = require("@dojo/core/global");
    var lang_1 = require("@dojo/core/lang");
    var queue_1 = require("@dojo/core/queue");
    var util_1 = require("@dojo/core/util");
    var d_1 = require("@dojo/widget-core/d");
    var WidgetBase_1 = require("@dojo/widget-core/WidgetBase");
    var Themeable_1 = require("@dojo/widget-core/mixins/Themeable");
    var project_1 = require("./project");
    var css = require("./styles/editor.m.css");
    var globalMonaco = global_1.default.monaco;
    /* tslint:disable:variable-name */
    var EditorBase = Themeable_1.ThemeableMixin(WidgetBase_1.default);
    /* tslint:enable:variable-name */
    var Editor = (function (_super) {
        __extends(Editor, _super);
        function Editor() {
            var _this = _super !== null && _super.apply(this, arguments) || this;
            _this._onDidChangeModelContent = function () {
                if (_this.properties.filename) {
                    project_1.default.setFileDirty(_this.properties.filename);
                }
            };
            _this._queuedLayout = false;
            return _this;
        }
        Editor.prototype._initEditor = function (element) {
            var _this = this;
            /* doing this async, during next macro task to help ensure the editor does a proper layout */
            queue_1.queueTask(function () {
                _this._editor = globalMonaco.editor.create(element, _this.properties.options);
                _this._didChangeHandle = _this._editor.onDidChangeModelContent(util_1.debounce(_this._onDidChangeModelContent, 1000));
                var onEditorInit = _this.properties.onEditorInit;
                onEditorInit && onEditorInit(_this._editor);
                _this.own(lang_1.createHandle(function () {
                    _this._editor.dispose();
                    _this._didChangeHandle.dispose();
                }));
            });
        };
        Editor.prototype.render = function () {
            return d_1.v('div', {
                afterCreate: this._initEditor,
                afterUpdate: this.updateEditor,
                classes: this.classes(css.base)
            });
        };
        Editor.prototype.updateEditor = function (node) {
            var _this = this;
            if (!this._editor) {
                return node;
            }
            if (this.properties.filename && project_1.default.includes(this.properties.filename)) {
                this._editor.setModel(project_1.default.getFileModel(this.properties.filename));
            }
            if (!this._queuedLayout) {
                this._queuedLayout = true;
                queue_1.queueTask(function () {
                    _this._editor.layout();
                    _this._queuedLayout = false;
                    var onEditorLayout = _this.properties.onEditorLayout;
                    onEditorLayout && onEditorLayout();
                });
            }
            return node;
        };
        return Editor;
    }(EditorBase));
    __decorate([
        WidgetBase_1.afterRender()
    ], Editor.prototype, "updateEditor", null);
    Editor = __decorate([
        Themeable_1.theme(css)
    ], Editor);
    exports.default = Editor;
});
//# sourceMappingURL=Editor.js.map