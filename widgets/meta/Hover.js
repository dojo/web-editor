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
        define(["require", "exports", "@dojo/shim/WeakMap", "@dojo/widget-core/meta/Base"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var WeakMap_1 = require("@dojo/shim/WeakMap");
    var Base_1 = require("@dojo/widget-core/meta/Base");
    var HoverController = /** @class */ (function () {
        function HoverController() {
            var _this = this;
            this._nodeMap = new WeakMap_1.default();
            this._onmouseenter = function (event) {
                // cannot end up here unless we have data in the map
                var data = _this._nodeMap.get(event.target);
                if (!data.hovering) {
                    data.hovering = true;
                    data.invalidate();
                }
            };
            this._onmouseleave = function (event) {
                // cannot end up here unless we have data in the map
                var data = _this._nodeMap.get(event.target);
                if (data.hovering) {
                    data.hovering = false;
                    data.invalidate();
                }
            };
        }
        HoverController.prototype.get = function (node, invalidate) {
            var _nodeMap = this._nodeMap;
            if (!_nodeMap.has(node)) {
                _nodeMap.set(node, { hovering: false, invalidate: invalidate });
                node.addEventListener('mouseenter', this._onmouseenter);
                node.addEventListener('mouseleave', this._onmouseleave);
            }
            return _nodeMap.get(node).hovering;
        };
        return HoverController;
    }());
    var controller = new HoverController();
    var Hover = /** @class */ (function (_super) {
        __extends(Hover, _super);
        function Hover() {
            var _this = _super !== null && _super.apply(this, arguments) || this;
            _this._boundInvalidate = _this.invalidate.bind(_this);
            return _this;
        }
        Hover.prototype.get = function (key) {
            var node = this.getNode(key);
            if (!node) {
                return false;
            }
            return controller.get(node, this._boundInvalidate);
        };
        return Hover;
    }(Base_1.Base));
    exports.default = Hover;
});
//# sourceMappingURL=Hover.js.map