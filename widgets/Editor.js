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
        define(["require", "exports", "@dojo/core/queue", "@dojo/core/util", "@dojo/widget-core/d", "@dojo/widget-core/WidgetBase", "@dojo/widget-core/mixins/Themed", "@dojo/widget-core/util/DomWrapper", "../styles/editor.m.css"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var queue_1 = require("@dojo/core/queue");
    var util_1 = require("@dojo/core/util");
    var d_1 = require("@dojo/widget-core/d");
    var WidgetBase_1 = require("@dojo/widget-core/WidgetBase");
    var Themed_1 = require("@dojo/widget-core/mixins/Themed");
    var DomWrapper_1 = require("@dojo/widget-core/util/DomWrapper");
    var css = require("../styles/editor.m.css");
    /**
     * The minimum width we should ever display the monaco-editor;
     */
    var MINIMUM_WIDTH = 150;
    /**
     * Return the size of an `HTMLElement`
     * @param target The target `HTMLElement`
     */
    function getSize(target) {
        var height = target.clientHeight, width = target.clientWidth;
        return { height: height, width: width };
    }
    /**
     * Compare the two sizes and return `true` if they are equal, otherwise `false`
     * @param a The first size to compare
     * @param b The second size to compare
     */
    function isEqualSize(a, b) {
        return a.height === b.height && a.width === b.width;
    }
    var ThemedBase = Themed_1.ThemedMixin(WidgetBase_1.default);
    /**
     * A class which wraps the `monaco-editor`
     */
    var Editor = /** @class */ (function (_super) {
        __extends(Editor, _super);
        function Editor() {
            var _this = _super.call(this) || this;
            _this._onDidChangeModelContent = function () {
                var onDirty = _this.properties.onDirty;
                onDirty && onDirty();
            };
            var root = _this._editorRoot = document.createElement('div');
            _this._EditorDom = DomWrapper_1.default(root);
            return _this;
        }
        Editor.prototype._layout = function () {
            var _a = this, _editor = _a._editor, _originalSize = _a._originalSize, _editorRoot = _a._editorRoot, onLayout = _a.properties.onLayout;
            if (!_editor) {
                return;
            }
            // If we are currently not at our original size, we will restore it, so that it won't interfere with the layout
            // of other elements
            if (!isEqualSize(getSize(_editorRoot), _originalSize)) {
                _editor.layout({ height: _originalSize.height, width: MINIMUM_WIDTH });
            }
            // Now at the end of the turn, we need to do the layout of the editor properly
            queue_1.queueTask(function () {
                var size = getSize(_editorRoot);
                if (!isEqualSize(size, { height: _originalSize.height, width: MINIMUM_WIDTH })) {
                    _editor.layout(size);
                    onLayout && onLayout();
                }
            });
        };
        Editor.prototype.onAttach = function () {
            var _this = this;
            var _a = this, _onDidChangeModelContent = _a._onDidChangeModelContent, _editorRoot = _a._editorRoot, _b = _a.properties, _c = _b.changeInterval, changeInterval = _c === void 0 ? 1000 : _c, model = _b.model, onInit = _b.onInit, onLayout = _b.onLayout, options = _b.options;
            // onAttach fires when the DOM is actually attached to the document, but the rest of the virtual DOM hasn't
            // been layed out which causes issues for monaco-editor when figuring out its initial size, so we will schedule
            // it to be run at the end of the turn, which will provide more reliable layout
            queue_1.queueTask(function () {
                var editor = _this._editor = monaco.editor.create(_editorRoot, options);
                _this._didChangeHandle = editor.onDidChangeModelContent(util_1.debounce(_onDidChangeModelContent, changeInterval));
                onInit && onInit(editor);
                _this._originalSize = getSize(_editorRoot);
                editor.layout();
                onLayout && onLayout();
                if (model) {
                    editor.setModel(model);
                }
            });
        };
        Editor.prototype.onDetach = function () {
            if (this._editor) {
                this._editor.dispose();
            }
            if (this._didChangeHandle) {
                this._didChangeHandle.dispose();
            }
        };
        Editor.prototype.render = function () {
            var _a = this, _currentModel = _a._currentModel, _editor = _a._editor, model = _a.properties.model;
            // getting the monaco-editor to layout and not interfere with the layout of other elements is a complicated affair
            // we have to do some quite obstuse logic in order for it to behave properly, but only do so if we suspect the
            // root node might resize after the render
            if (this.properties.layout) {
                this._layout();
            }
            // display the _model_ (file) in the editor
            // re-renders fire a lot more often then model changes, so caching it for performance reasons
            if (_editor && model && _currentModel !== model) {
                _editor.setModel(model);
                this._currentModel = model;
            }
            // displaying a model can be an issue, so we are going to hide the editor when there is no valid model
            var hasModel = model && model.uri.toString().match(/^file:\/{2}/);
            return d_1.w(this._EditorDom, {
                classes: [this.theme(css.root), css.rootFixed, hasModel ? null : css.hide],
                key: 'root'
            });
        };
        Editor = __decorate([
            Themed_1.theme(css)
        ], Editor);
        return Editor;
    }(ThemedBase));
    exports.default = Editor;
});
//# sourceMappingURL=Editor.js.map