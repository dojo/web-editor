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
        define(["require", "exports", "@dojo/widget-core/d", "@dojo/widget-core/WidgetBase", "./support/icons"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var d_1 = require("@dojo/widget-core/d");
    var WidgetBase_1 = require("@dojo/widget-core/WidgetBase");
    var icons_1 = require("./support/icons");
    /**
     * A function that converts an `IconJson` structure into CSS text
     * @param sourcePath The base URL where the icons are located
     * @param baseClass The base class name which an icon is based off of
     * @param icons An object structure that defines icon classes
     */
    function getStylesFromJson(sourcePath, baseClass, icons) {
        var resolver = new icons_1.IconResolver(sourcePath, icons);
        var styles = '';
        function before(selector) {
            return selector + '::before';
        }
        function toSelector() {
            var classes = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                classes[_i] = arguments[_i];
            }
            return '.' + classes.join('.');
        }
        function iconStyle(selector, iconUrl) {
            return before(selector) + " { content: ' '; background-image: url('" + iconUrl + "'); }\n";
        }
        for (var key in icons.iconDefinitions) {
            styles += iconStyle(toSelector(baseClass, key), resolver.iconUrl(key));
        }
        return styles;
    }
    var IconCss = (function (_super) {
        __extends(IconCss, _super);
        function IconCss() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        IconCss.prototype.render = function () {
            return d_1.v('style', {
                media: 'screen',
                type: 'text/css'
            }, [
                this.properties.icons && this.properties.sourcePath && getStylesFromJson(this.properties.sourcePath, this.properties.baseClass, this.properties.icons) || null
            ]);
        };
        return IconCss;
    }(WidgetBase_1.default));
    exports.default = IconCss;
});
//# sourceMappingURL=IconCss.js.map