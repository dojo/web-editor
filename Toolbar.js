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
        define(["require", "exports", "@dojo/widget-core/d", "@dojo/widget-core/mixins/Themeable", "@dojo/widget-core/WidgetBase", "./styles/actionbar.m.css", "./styles/actionbarbutton.m.css", "./styles/icons.m.css", "./styles/tab.m.css", "./styles/tablist.m.css", "./styles/toolbar.m.css"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var d_1 = require("@dojo/widget-core/d");
    var Themeable_1 = require("@dojo/widget-core/mixins/Themeable");
    var WidgetBase_1 = require("@dojo/widget-core/WidgetBase");
    var actionbarCss = require("./styles/actionbar.m.css");
    var actionbarbuttonCss = require("./styles/actionbarbutton.m.css");
    var iconCss = require("./styles/icons.m.css");
    var tabCss = require("./styles/tab.m.css");
    var tablistCss = require("./styles/tablist.m.css");
    var toolbarCss = require("./styles/toolbar.m.css");
    var ThemeableBase = Themeable_1.ThemeableMixin(WidgetBase_1.default);
    var ActionBar = (function (_super) {
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
    exports.ActionBar = ActionBar;
    var ActionBarButton = (function (_super) {
        __extends(ActionBarButton, _super);
        function ActionBarButton() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        ActionBarButton.prototype._onClick = function () {
            var onClick = this.properties.onClick;
            onClick && onClick();
        };
        ActionBarButton.prototype.render = function () {
            var _a = this.properties, iconClass = _a.iconClass, title = _a.label;
            return d_1.v('li', {
                classes: this.classes(actionbarbuttonCss.root).fixed(actionbarbuttonCss.rootFixed),
                role: 'presentation'
            }, [
                d_1.v('a', {
                    classes: this.classes(actionbarbuttonCss.label).fixed(actionbarbuttonCss.labelFixed, iconClass || null),
                    role: 'button',
                    tabIndex: 0,
                    title: title,
                    onclick: this._onClick
                })
            ]);
        };
        ActionBarButton = __decorate([
            Themeable_1.theme(actionbarbuttonCss)
        ], ActionBarButton);
        return ActionBarButton;
    }(ThemeableBase));
    exports.ActionBarButton = ActionBarButton;
    var Tab = (function (_super) {
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
            var _a = this.properties, iconClass = _a.iconClass, label = _a.label, labelDescription = _a.labelDescription, selected = _a.selected, title = _a.title;
            return d_1.v('div', {
                'aria-label': label + ", tab",
                classes: this.classes(tabCss.root, selected ? tabCss.selected : null).fixed(tabCss.rootFixed),
                role: 'presentation',
                tabIndex: 0,
                title: title
            }, [
                d_1.v('div', {
                    classes: this.classes(tabCss.label).fixed(tabCss.labelFixed, iconCss.label, iconClass || null),
                    title: title
                }, [
                    d_1.v('a', {
                        classes: this.classes().fixed(tabCss.link),
                        onclick: this._onclick
                    }, [label]),
                    d_1.v('span', {
                        classes: this.classes(tabCss.description).fixed(tabCss.descriptionFixed)
                    }, [labelDescription])
                ]),
                d_1.v('div', {
                    classes: this.classes(tabCss.closer),
                    key: 'closer'
                }, [
                    d_1.w(ActionBar, {
                        label: 'Tab actions'
                    }, [
                        d_1.w(ActionBarButton, {
                            iconClass: tabCss.closeIcon,
                            label: "Close " + label,
                            onClick: this._onActionBarButtonClick
                        })
                    ])
                ])
            ]);
        };
        Tab = __decorate([
            Themeable_1.theme(tabCss)
        ], Tab);
        return Tab;
    }(ThemeableBase));
    exports.Tab = Tab;
    var Tablist = (function (_super) {
        __extends(Tablist, _super);
        function Tablist() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        Tablist.prototype.render = function () {
            return d_1.v('div', {
                classes: this.classes(tablistCss.root).fixed(tablistCss.rootFixed),
                key: 'root',
                role: 'presentation'
            }, [
                d_1.v('div', {
                    classes: this.classes(tablistCss.tablist).fixed(tablistCss.tablistFixed),
                    key: 'tablist',
                    role: 'tablist'
                }, this.children)
            ]);
        };
        Tablist = __decorate([
            Themeable_1.theme(tablistCss)
        ], Tablist);
        return Tablist;
    }(ThemeableBase));
    exports.Tablist = Tablist;
    var Toolbar = (function (_super) {
        __extends(Toolbar, _super);
        function Toolbar() {
            var _this = _super !== null && _super.apply(this, arguments) || this;
            _this._onFilesClick = function () {
                var onToggleFiles = _this.properties.onToggleFiles;
                onToggleFiles && onToggleFiles();
            };
            _this._onRunnerClick = function () {
                var onToggleRunner = _this.properties.onToggleRunner;
                onToggleRunner && onToggleRunner();
            };
            return _this;
        }
        Toolbar.prototype.render = function () {
            var _a = this.properties, filesOpen = _a.filesOpen, runnerOpen = _a.runnerOpen, theme = _a.theme;
            return d_1.v('div', {
                classes: this.classes(toolbarCss.root).fixed(toolbarCss.rootFixed),
                key: 'root'
            }, [
                d_1.w(ActionBar, {
                    key: 'fileActions',
                    label: 'File actions',
                    theme: theme
                }, [
                    d_1.w(ActionBarButton, {
                        label: 'Toggle files',
                        iconClass: filesOpen ? toolbarCss.filesIconOpen : toolbarCss.filesIconClosed,
                        theme: theme,
                        onClick: this._onFilesClick
                    })
                ]),
                d_1.w(Tablist, {
                    theme: theme
                }, this.children),
                d_1.w(ActionBar, {
                    key: 'runnerActions',
                    label: 'Runner actions',
                    theme: theme
                }, [
                    d_1.w(ActionBarButton, {
                        label: 'Toggle runner',
                        iconClass: runnerOpen ? toolbarCss.previewIconOpen : toolbarCss.previewIconClosed,
                        theme: theme,
                        onClick: this._onRunnerClick
                    })
                ])
            ]);
        };
        Toolbar = __decorate([
            Themeable_1.theme(toolbarCss)
        ], Toolbar);
        return Toolbar;
    }(ThemeableBase));
    exports.default = Toolbar;
});
//# sourceMappingURL=Toolbar.js.map