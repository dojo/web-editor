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
        define(["require", "exports", "@dojo/widget-core/d", "@dojo/widget-core/WidgetBase", "@dojo/widget-core/mixins/Themed", "./styles/livecodeexample.m.css", "./widgets/LiveEditor"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var d_1 = require("@dojo/widget-core/d");
    var WidgetBase_1 = require("@dojo/widget-core/WidgetBase");
    var Themed_1 = require("@dojo/widget-core/mixins/Themed");
    var livecodeexampleCss = require("./styles/livecodeexample.m.css");
    var LiveEditor_1 = require("./widgets/LiveEditor");
    var isArray = Array.isArray;
    var DIV = 'div';
    var ThemedBase = Themed_1.ThemedMixin(WidgetBase_1.default);
    var LiveCodeExample = /** @class */ (function (_super) {
        __extends(LiveCodeExample, _super);
        function LiveCodeExample() {
            var _this = _super !== null && _super.apply(this, arguments) || this;
            _this._onDirty = function () {
                var _a = _this.properties, id = _a.id, onDirty = _a.onDirty;
                onDirty && onDirty(id);
            };
            return _this;
        }
        LiveCodeExample.prototype.render = function () {
            var _a = this, onDirty = _a._onDirty, _b = _a.properties, _c = _b.changeInterval, changeInterval = _c === void 0 ? 1000 : _c, id = _b.id, description = _b.description, model = _b.model, program = _b.program, runnerSrc = _b.runnerSrc, title = _b.title;
            return d_1.v(DIV, {
                classes: [this.theme(livecodeexampleCss.root), livecodeexampleCss.rootFixed],
                id: id,
                key: 'root'
            }, [
                d_1.v(DIV, {
                    classes: this.theme(livecodeexampleCss.left),
                    key: 'left'
                }, [
                    d_1.v('h1', {}, isArray(title) ? title : [title]),
                    d_1.v(DIV, {
                        classes: this.theme(livecodeexampleCss.description)
                    }, [
                        d_1.v('p', {}, isArray(description) ? description : [description])
                    ])
                ]),
                d_1.v(DIV, {
                    classes: this.theme(livecodeexampleCss.right),
                    key: 'right'
                }, [
                    d_1.w(LiveEditor_1.default, {
                        changeInterval: changeInterval,
                        id: id,
                        model: model,
                        program: program,
                        runnerSrc: runnerSrc,
                        onDirty: onDirty
                    })
                ])
            ]);
        };
        LiveCodeExample = __decorate([
            Themed_1.theme(livecodeexampleCss)
        ], LiveCodeExample);
        return LiveCodeExample;
    }(ThemedBase));
    exports.default = LiveCodeExample;
});
//# sourceMappingURL=LiveCodeExample.js.map