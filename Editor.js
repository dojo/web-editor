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
    /**
     * The minimum width we should ever display the monaco-editor;
     */
    var MINIMUM_WIDTH = 150;
    var globalMonaco = global_1.default.monaco;
    function getSize(element) {
        var height = element.clientHeight, width = element.clientWidth;
        return { height: height, width: width };
    }
    function isEqualSize(a, b) {
        return a.height === b.height && a.width === b.width;
    }
    var EditorBase = Themeable_1.ThemeableMixin(WidgetBase_1.default);
    var Editor = (function (_super) {
        __extends(Editor, _super);
        function Editor() {
            var _this = _super.call(this) || this;
            _this._emptyModel = monaco.editor.createModel('');
            _this._onAttached = function () {
                var _a = _this, _onDidChangeModelContent = _a._onDidChangeModelContent, _root = _a._root, _b = _a.properties, onEditorInit = _b.onEditorInit, onEditorLayout = _b.onEditorLayout, options = _b.options;
                // _onAttached fires when the DOM is actually attached to the document, but the rest of the virtual DOM hasn't
                // been layed out which causes issues for monaco-editor when figuring out its initial size, so we will schedule
                // it to be run at the end of the turn, which will provide more reliable layout
                queue_1.queueTask(function () {
                    var editor = _this._editor = globalMonaco.editor.create(_root, options);
                    var didChangeHandle = _this._didChangeHandle = editor.onDidChangeModelContent(util_1.debounce(_onDidChangeModelContent, 1000));
                    _this._setModel();
                    onEditorInit && onEditorInit(editor);
                    _this.own(lang_1.createHandle(function () {
                        editor.dispose();
                        didChangeHandle.dispose();
                    }));
                    _this._originalSize = getSize(_root);
                    editor.layout();
                    onEditorLayout && onEditorLayout();
                });
            };
            _this._onDidChangeModelContent = function () {
                var filename = _this.properties.filename;
                if (filename) {
                    project_1.default.setFileDirty(filename);
                }
            };
            var root = _this._root = document.createElement('div');
            _this._EditorDom = DomWrapper_1.default(root, { onAttached: _this._onAttached });
            return _this;
        }
        Editor.prototype._layout = function () {
            var _a = this, _editor = _a._editor, _originalSize = _a._originalSize, _root = _a._root, onEditorLayout = _a.properties.onEditorLayout;
            if (!_editor) {
                return;
            }
            // If we are currently not at our original size, we will restore it, so that it won't interfere with the layout
            // of other elements
            if (!isEqualSize(getSize(_root), _originalSize)) {
                _editor.layout({ height: _originalSize.height, width: MINIMUM_WIDTH });
            }
            // Now at the end of the turn, we need to do the layout of the editor properly
            queue_1.queueTask(function () {
                var size = getSize(_root);
                if (!isEqualSize(size, { height: _originalSize.height, width: MINIMUM_WIDTH })) {
                    _editor.layout(size);
                    onEditorLayout && onEditorLayout();
                }
            });
        };
        Editor.prototype._setModel = function () {
            var _a = this, _editor = _a._editor, _emptyModel = _a._emptyModel, filename = _a.properties.filename;
            if (_editor && filename && project_1.default.includes(filename)) {
                var fileModel = project_1.default.getFileModel(filename);
                if (fileModel !== this._currentModel) {
                    _editor.setModel(fileModel);
                    this._currentModel = fileModel;
                }
            }
            else if (_editor && filename === '' && this._currentModel !== _emptyModel) {
                _editor.setModel(_emptyModel);
                this._currentModel = _emptyModel;
            }
        };
        Editor.prototype.render = function () {
            // getting the monaco-editor to layout and not interfere with the layout of other elements is a complicated affair
            // we have to do some quite obstuse logic in order for it to behave properly, but only do so if we suspect the
            // root node might resize after the render
            if (this.properties.layout) {
                this._layout();
            }
            // Ensure we are displaying the correct file
            this._setModel();
            return d_1.w(this._EditorDom, {
                classes: this.classes(css.root).fixed(css.rootFixed),
                key: 'root'
            });
        };
        Editor = __decorate([
            Themeable_1.theme(css)
        ], Editor);
        return Editor;
    }(EditorBase));
    exports.default = Editor;
});
//# sourceMappingURL=Editor.js.map