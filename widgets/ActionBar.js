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
        define(["require", "exports", "@dojo/widget-core/d", "@dojo/widget-core/mixins/Themeable", "@dojo/widget-core/WidgetBase", "../styles/actionbar.m.css", "../styles/actionbarbutton.m.css"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var d_1 = require("@dojo/widget-core/d");
    var Themeable_1 = require("@dojo/widget-core/mixins/Themeable");
    var WidgetBase_1 = require("@dojo/widget-core/WidgetBase");
    var actionbarCss = require("../styles/actionbar.m.css");
    var actionbarbuttonCss = require("../styles/actionbarbutton.m.css");
    var ThemeableBase = Themeable_1.ThemeableMixin(WidgetBase_1.default);
    /**
     * A widget which provides a simple icon UI element that performs a single action
     */
    var ActionBarButton = /** @class */ (function (_super) {
        __extends(ActionBarButton, _super);
        function ActionBarButton() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        ActionBarButton.prototype._onclick = function () {
            var onClick = this.properties.onClick;
            onClick && onClick();
        };
        ActionBarButton.prototype.render = function () {
            var _a = this.properties, iconClass = _a.iconClass, title = _a.label;
            return d_1.v('li', {
                classes: this.classes(actionbarbuttonCss.root).fixed(actionbarbuttonCss.rootFixed),
                role: 'presentation',
                onclick: this._onclick
            }, [
                d_1.v('a', {
                    classes: this.classes(actionbarbuttonCss.label).fixed(actionbarbuttonCss.labelFixed, iconClass || null),
                    role: 'button',
                    tabIndex: 0,
                    title: title
                })
            ]);
        };
        ActionBarButton = __decorate([
            Themeable_1.theme(actionbarbuttonCss)
        ], ActionBarButton);
        return ActionBarButton;
    }(ThemeableBase));
    exports.ActionBarButton = ActionBarButton;
    /**
     * A widget which contains children `ActionBarButton`
     */
    var ActionBar = /** @class */ (function (_super) {
        __extends(ActionBar, _super);
        function ActionBar() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        ActionBar.prototype.render = function () {
            return d_1.v('div', {
                classes: this.classes(actionbarCss.root).fixed(actionbarCss.rootFixed),
                key: 'root'
            }, [
                d_1.v('ul', {
                    'aria-label': this.properties.label,
                    classes: this.classes(actionbarCss.toolbar).fixed(actionbarCss.toolbarFixed),
                    role: 'toolbar'
                }, this.children)
            ]);
        };
        ActionBar = __decorate([
            Themeable_1.theme(actionbarCss)
        ], ActionBar);
        return ActionBar;
    }(ThemeableBase));
    exports.default = ActionBar;
});
//# sourceMappingURL=ActionBar.js.map