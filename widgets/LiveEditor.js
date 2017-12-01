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
        define(["require", "exports", "vs/editor/editor.main", "@dojo/shim/object", "@dojo/widget-core/d", "@dojo/widget-core/WidgetBase", "@dojo/widget-core/mixins/Themed", "./Editor", "./Runner", "../styles/liveeditor.m.css"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    require("vs/editor/editor.main"); /* imported for side-effects */
    var object_1 = require("@dojo/shim/object");
    var d_1 = require("@dojo/widget-core/d");
    var WidgetBase_1 = require("@dojo/widget-core/WidgetBase");
    var Themed_1 = require("@dojo/widget-core/mixins/Themed");
    var Editor_1 = require("./Editor");
    var Runner_1 = require("./Runner");
    var liveeditorCss = require("../styles/liveeditor.m.css");
    var ThemedBase = Themed_1.ThemedMixin(WidgetBase_1.default);
    var LiveEditor = /** @class */ (function (_super) {
        __extends(LiveEditor, _super);
        function LiveEditor() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        LiveEditor.prototype.render = function () {
            var _a = this.properties, _b = _a.changeInterval, changeInterval = _b === void 0 ? 1000 : _b, id = _a.id, model = _a.model, program = _a.program, src = _a.runnerSrc, onDirty = _a.onDirty;
            var runnerProperties = object_1.assign({}, program, { key: 'runner', main: "src/" + id, src: src });
            return d_1.v('div', {
                classes: [this.theme(liveeditorCss.root), liveeditorCss.rootFixed]
            }, [
                d_1.v('div', {
                    classes: this.theme(liveeditorCss.left),
                    key: 'left'
                }, [
                    d_1.v('div', {}, ['Live Editor']),
                    d_1.w(Editor_1.default, {
                        changeInterval: changeInterval,
                        key: 'editor',
                        model: model,
                        options: {
                            lineNumbers: 'off',
                            minimap: { enabled: false }
                        },
                        onDirty: onDirty
                    })
                ]),
                d_1.v('div', {
                    classes: this.theme(liveeditorCss.right),
                    key: 'right'
                }, [
                    d_1.v('div', {}, ['Result']),
                    d_1.w(Runner_1.default, runnerProperties)
                ])
            ]);
        };
        LiveEditor = __decorate([
            Themed_1.theme(liveeditorCss)
        ], LiveEditor);
        return LiveEditor;
    }(ThemedBase));
    exports.default = LiveEditor;
});
//# sourceMappingURL=LiveEditor.js.map