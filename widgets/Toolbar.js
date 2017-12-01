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
        define(["require", "exports", "@dojo/widget-core/d", "@dojo/widget-core/mixins/Themed", "@dojo/widget-core/WidgetBase", "./ActionBar", "./Tablist", "../styles/toolbar.m.css"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var d_1 = require("@dojo/widget-core/d");
    var Themed_1 = require("@dojo/widget-core/mixins/Themed");
    var WidgetBase_1 = require("@dojo/widget-core/WidgetBase");
    var ActionBar_1 = require("./ActionBar");
    var Tablist_1 = require("./Tablist");
    var toolbarCss = require("../styles/toolbar.m.css");
    var ThemedBase = Themed_1.ThemedMixin(WidgetBase_1.default);
    /**
     * A widget which provides a tab list of tabs based on open files and three actions buttons to control the workbench UI
     * What tabs are displayed are the widget's children.
     */
    var Toolbar = /** @class */ (function (_super) {
        __extends(Toolbar, _super);
        function Toolbar() {
            var _this = _super !== null && _super.apply(this, arguments) || this;
            _this._onFilesClick = function () {
                var onToggleFiles = _this.properties.onToggleFiles;
                onToggleFiles && onToggleFiles();
            };
            _this._onRunClick = function () {
                var onRunClick = _this.properties.onRunClick;
                onRunClick && onRunClick();
            };
            _this._onRunnerClick = function () {
                var onToggleRunner = _this.properties.onToggleRunner;
                onToggleRunner && onToggleRunner();
            };
            return _this;
        }
        Toolbar.prototype.render = function () {
            var _a = this.properties, filesOpen = _a.filesOpen, runnable = _a.runnable, runnerOpen = _a.runnerOpen, theme = _a.theme;
            return d_1.v('div', {
                classes: [this.theme(toolbarCss.root), toolbarCss.rootFixed],
                key: 'root'
            }, [
                d_1.w(ActionBar_1.default, {
                    key: 'fileActions',
                    label: 'File actions',
                    theme: theme
                }, [
                    d_1.w(ActionBar_1.ActionBarButton, {
                        label: 'Toggle files',
                        iconClass: filesOpen ? toolbarCss.filesIconOpen : toolbarCss.filesIconClosed,
                        theme: theme,
                        onClick: this._onFilesClick
                    })
                ]),
                d_1.w(Tablist_1.default, {
                    theme: theme
                }, this.children),
                d_1.w(ActionBar_1.default, {
                    key: 'runnerActions',
                    label: 'Runner actions',
                    theme: theme
                }, [
                    d_1.w(ActionBar_1.ActionBarButton, {
                        key: 'runProject',
                        label: 'Run project',
                        iconClass: runnable ? toolbarCss.runIconEnabled : toolbarCss.runIconDisabled,
                        theme: theme,
                        onClick: this._onRunClick
                    }),
                    d_1.w(ActionBar_1.ActionBarButton, {
                        key: 'toggleRunner',
                        label: 'Toggle runner',
                        iconClass: runnerOpen ? toolbarCss.previewIconOpen : toolbarCss.previewIconClosed,
                        theme: theme,
                        onClick: this._onRunnerClick
                    })
                ])
            ]);
        };
        Toolbar = __decorate([
            Themed_1.theme(toolbarCss)
        ], Toolbar);
        return Toolbar;
    }(ThemedBase));
    exports.default = Toolbar;
});
//# sourceMappingURL=Toolbar.js.map