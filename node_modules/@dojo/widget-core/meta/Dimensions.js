(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "tslib", "./Base", "@dojo/core/lang"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var tslib_1 = require("tslib");
    var Base_1 = require("./Base");
    var lang_1 = require("@dojo/core/lang");
    var defaultDimensions = {
        offset: {
            height: 0,
            left: 0,
            top: 0,
            width: 0
        },
        position: {
            bottom: 0,
            left: 0,
            right: 0,
            top: 0
        },
        scroll: {
            height: 0,
            left: 0,
            top: 0,
            width: 0
        },
        size: {
            width: 0,
            height: 0
        }
    };
    var Dimensions = /** @class */ (function (_super) {
        tslib_1.__extends(Dimensions, _super);
        function Dimensions() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        Dimensions.prototype.get = function (key) {
            var node = this.getNode(key);
            if (!node) {
                return lang_1.deepAssign({}, defaultDimensions);
            }
            var boundingDimensions = node.getBoundingClientRect();
            return {
                offset: {
                    height: node.offsetHeight,
                    left: node.offsetLeft,
                    top: node.offsetTop,
                    width: node.offsetWidth
                },
                position: {
                    bottom: boundingDimensions.bottom,
                    left: boundingDimensions.left,
                    right: boundingDimensions.right,
                    top: boundingDimensions.top
                },
                scroll: {
                    height: node.scrollHeight,
                    left: node.scrollLeft,
                    top: node.scrollTop,
                    width: node.scrollWidth
                },
                size: {
                    width: boundingDimensions.width,
                    height: boundingDimensions.height
                }
            };
        };
        return Dimensions;
    }(Base_1.Base));
    exports.Dimensions = Dimensions;
    exports.default = Dimensions;
});
//# sourceMappingURL=Dimensions.js.map