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
        define(["require", "exports", "@dojo/shim/array", "@dojo/widget-core/d", "@dojo/widget-core/meta/Dimensions", "@dojo/widget-core/mixins/Themed", "@dojo/widget-core/WidgetBase", "./ActionBar", "./ScrollBar", "./meta/Hover", "../styles/icons.m.css", "../styles/tab.m.css", "../styles/tablist.m.css", "../styles/tablistscrollbar.m.css"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var array_1 = require("@dojo/shim/array");
    var d_1 = require("@dojo/widget-core/d");
    var Dimensions_1 = require("@dojo/widget-core/meta/Dimensions");
    var Themed_1 = require("@dojo/widget-core/mixins/Themed");
    var WidgetBase_1 = require("@dojo/widget-core/WidgetBase");
    var ActionBar_1 = require("./ActionBar");
    var ScrollBar_1 = require("./ScrollBar");
    var Hover_1 = require("./meta/Hover");
    var iconCss = require("../styles/icons.m.css");
    var tabCss = require("../styles/tab.m.css");
    var tablistCss = require("../styles/tablist.m.css");
    var tablistScrollbarCss = require("../styles/tablistscrollbar.m.css");
    var ThemeableBase = Themed_1.ThemedMixin(WidgetBase_1.default);
    /**
     * A widget which provides a tab representation of its properties
     */
    var Tab = /** @class */ (function (_super) {
        __extends(Tab, _super);
        function Tab() {
            var _this = _super !== null && _super.apply(this, arguments) || this;
            _this._onActionBarButtonClick = function () {
                var _a = _this.properties, key = _a.key, label = _a.label, onClose = _a.onClose;
                onClose && onClose(key, label);
            };
            return _this;
        }
        Tab.prototype._onclick = function () {
            var _a = this.properties, key = _a.key, label = _a.label, onSelect = _a.onSelect, selected = _a.selected;
            if (!selected && onSelect) {
                onSelect(key, label);
            }
        };
        Tab.prototype.render = function () {
            var _a = this.properties, iconClass = _a.iconClass, key = _a.key, label = _a.label, labelDescription = _a.labelDescription, selected = _a.selected, title = _a.title;
            return d_1.v('div', {
                'aria-label': label + ", tab",
                classes: this.theme([tabCss.root, selected ? tabCss.selected : null]).concat([tabCss.rootFixed]),
                key: key,
                role: 'tab',
                tabIndex: 0,
                title: title,
                onclick: this._onclick
            }, [
                d_1.v('div', {
                    classes: [this.theme(tabCss.label), tabCss.labelFixed, iconCss.label, iconClass || null],
                    title: title
                }, [
                    d_1.v('a', {
                        classes: tabCss.link
                    }, [label]),
                    d_1.v('span', {
                        classes: [this.theme(tabCss.description), tabCss.descriptionFixed]
                    }, [labelDescription])
                ]),
                d_1.v('div', {
                    classes: this.theme(tabCss.closer),
                    key: 'closer'
                }, [
                    d_1.w(ActionBar_1.default, {
                        label: 'Tab actions'
                    }, [
                        d_1.w(ActionBar_1.ActionBarButton, {
                            iconClass: tabCss.closeIcon,
                            label: "Close " + label,
                            onClick: this._onActionBarButtonClick
                        })
                    ])
                ])
            ]);
        };
        Tab = __decorate([
            Themed_1.theme(tabCss)
        ], Tab);
        return Tab;
    }(ThemeableBase));
    exports.Tab = Tab;
    /**
     * A scrollbar where the theme is tied to the Tablist
     */
    var TablistScrollBar = /** @class */ (function (_super) {
        __extends(TablistScrollBar, _super);
        function TablistScrollBar() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        TablistScrollBar = __decorate([
            Themed_1.theme(tablistScrollbarCss)
        ], TablistScrollBar);
        return TablistScrollBar;
    }(ScrollBar_1.default));
    exports.TablistScrollBar = TablistScrollBar;
    /**
     * A widget which contains tabs
     */
    var Tablist = /** @class */ (function (_super) {
        __extends(Tablist, _super);
        function Tablist() {
            var _this = _super !== null && _super.apply(this, arguments) || this;
            _this._position = 0;
            _this._onwheel = function (event) {
                var delta = event.deltaX;
                if (delta) {
                    event.preventDefault();
                    _this._position += delta;
                    _this.invalidate();
                }
            };
            return _this;
        }
        Tablist.prototype._getChildren = function () {
            var _this = this;
            return this.children.map(function (child) {
                if (!child) {
                    return child;
                }
                return d_1.v('div', {
                    key: child.properties.key,
                    classes: [_this.theme(tablistCss.tab), tablistCss.tabFixed]
                }, [child]);
            });
        };
        Tablist.prototype._getSelectedKey = function () {
            var children = this.children;
            var selectedChild = array_1.find(children, function (child) {
                return Boolean(child && child.properties.selected);
            });
            if (selectedChild && selectedChild.properties.key) {
                return selectedChild.properties.key;
            }
        };
        Tablist.prototype._onScroll = function (delta) {
            this._position += delta;
            this.invalidate();
        };
        Tablist.prototype._setPosition = function (dimensions) {
            var selectedKey = this._getSelectedKey();
            if (selectedKey && selectedKey !== this._cachedSelectedKey) {
                var selectedDimensions = this.meta(Dimensions_1.default).get(selectedKey);
                if (selectedDimensions.size.width) {
                    this._cachedSelectedKey = selectedKey;
                }
                else {
                    return;
                }
                if (this._position > selectedDimensions.offset.left) {
                    this._position = selectedDimensions.offset.left;
                }
                else if ((this._position + dimensions.size.width) < (selectedDimensions.offset.left + selectedDimensions.offset.width)) {
                    this._position = selectedDimensions.offset.left + selectedDimensions.offset.width - dimensions.size.width;
                }
            }
            else {
                if (this._position < 0) {
                    this._position = 0;
                }
                else if ((this._position + dimensions.size.width) > dimensions.scroll.width) {
                    this._position = dimensions.scroll.width - dimensions.size.width;
                }
            }
        };
        Tablist.prototype.render = function () {
            var visible = this.meta(Hover_1.default).get('root');
            var tablistDimensions = this.meta(Dimensions_1.default).get('tablist');
            this._setPosition(tablistDimensions);
            var _a = this, _position = _a._position, theme = _a.properties.theme;
            return d_1.v('div', {
                classes: [this.theme(tablistCss.root), tablistCss.rootFixed],
                key: 'root',
                role: 'presentation'
            }, [
                d_1.v('div', {
                    classes: [this.theme(tablistCss.tablist), tablistCss.tablistFixed],
                    key: 'tablist',
                    role: 'tablist',
                    styles: {
                        left: _position ? "-" + _position + "px" : '0'
                    },
                    onwheel: this._onwheel
                }, this._getChildren()),
                d_1.w(TablistScrollBar, {
                    horizontal: true,
                    position: _position,
                    size: tablistDimensions.scroll.width,
                    sliderSize: tablistDimensions.size.width,
                    theme: theme,
                    visible: visible,
                    onScroll: this._onScroll
                })
            ]);
        };
        Tablist = __decorate([
            Themed_1.theme(tablistCss)
        ], Tablist);
        return Tablist;
    }(ThemeableBase));
    exports.default = Tablist;
});
//# sourceMappingURL=Tablist.js.map