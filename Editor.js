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
        define(["require", "exports", "@dojo/core/global", "@dojo/core/lang", "@dojo/core/queue", "@dojo/core/util", "@dojo/widget-core/d", "@dojo/widget-core/WidgetBase", "@dojo/widget-core/mixins/Themeable", "@dojo/widget-core/util/DomWrapper", "./project", "./styles/editor.m.css"], factory);
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
    var DomWrapper_1 = require("@dojo/widget-core/util/DomWrapper");
    var project_1 = require("./project");
    var css = require("./styles/editor.m.css");
    var globalMonaco = global_1.default.monaco;
    var EditorBase = Themeable_1.ThemeableMixin(WidgetBase_1.default);
    var Editor = (function (_super) {
        __extends(Editor, _super);
        function Editor() {
            var _this = _super.call(this) || this;
            _this._onAfterRender = function () {
                if (!_this._editor) {
                    _this._editor = globalMonaco.editor.create(_this._root, _this.properties.options);
                    _this._didChangeHandle = _this._editor.onDidChangeModelContent(util_1.debounce(_this._onDidChangeModelContent, 1000));
                    var onEditorInit = _this.properties.onEditorInit;
                    _this._setModel();
                    onEditorInit && onEditorInit(_this._editor);
                    _this.own(lang_1.createHandle(function () {
                        if (_this._editor) {
                            _this._editor.dispose();
                            _this._didChangeHandle.dispose();
                        }
                    }));
                }
                _this._editor.layout();
                _this._queuedLayout = false;
                var onEditorLayout = _this.properties.onEditorLayout;
                onEditorLayout && onEditorLayout();
            };
            _this._onDidChangeModelContent = function () {
                if (_this.properties.filename) {
                    project_1.default.setFileDirty(_this.properties.filename);
                }
            };
            _this._queuedLayout = false;
            var root = _this._root = document.createElement('div');
            root.style.height = '100%';
            root.style.width = '100%';
            _this._EditorDom = DomWrapper_1.default(root);
            return _this;
        }
        Editor.prototype._setModel = function () {
            var filename = this.properties.filename;
            if (this._editor && filename && project_1.default.includes(filename)) {
                this._editor.setModel(project_1.default.getFileModel(filename));
            }
        };
        Editor.prototype.render = function () {
            /* TODO: Refactor when https://github.com/dojo/widget-core/pull/548 published */
            if (!this._queuedLayout) {
                /* doing this async, during the next major task, to allow the widget to actually render */
                this._queuedLayout = true;
                queue_1.queueTask(this._onAfterRender);
            }
            this._setModel();
            /* TODO: Create single node when https://github.com/dojo/widget-core/issues/553 resolved */
            return d_1.v('div', {
                classes: this.classes(css.root)
            }, [this.properties.filename ? d_1.w(this._EditorDom, { key: 'editor' }) : null]);
        };
        return Editor;
    }(EditorBase));
    Editor = __decorate([
        Themeable_1.theme(css)
    ], Editor);
    exports.default = Editor;
});
//# sourceMappingURL=Editor.js.map