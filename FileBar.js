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
        define(["require", "exports", "@dojo/core/uuid", "@dojo/widget-core/d", "@dojo/widget-core/mixins/Themeable", "@dojo/widget-core/WidgetBase", "@dojo/widgets/tabpane/TabButton", "@dojo/widgets/tabpane/styles/tabPane.m.css"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var uuid_1 = require("@dojo/core/uuid");
    var d_1 = require("@dojo/widget-core/d");
    var Themeable_1 = require("@dojo/widget-core/mixins/Themeable");
    var WidgetBase_1 = require("@dojo/widget-core/WidgetBase");
    var TabButton_1 = require("@dojo/widgets/tabpane/TabButton");
    var css = require("@dojo/widgets/tabpane/styles/tabPane.m.css");
    var ThemeableBase = Themeable_1.ThemeableMixin(WidgetBase_1.WidgetBase);
    var FileBar = (function (_super) {
        __extends(FileBar, _super);
        function FileBar() {
            var _this = _super !== null && _super.apply(this, arguments) || this;
            _this._id = uuid_1.default();
            return _this;
        }
        // private _callTabFocus = false;
        FileBar.prototype._onDownArrowPress = function () {
            var alignButtons = this.properties.alignButtons;
            if (alignButtons === 1 /* left */ || alignButtons === 2 /* right */) {
                this.selectNextIndex();
            }
        };
        FileBar.prototype._onLeftArrowPress = function () {
            this.selectPreviousIndex();
        };
        FileBar.prototype._onRightArrowPress = function () {
            this.selectNextIndex();
        };
        FileBar.prototype._onUpArrowPress = function () {
            var alignButtons = this.properties.alignButtons;
            if (alignButtons === 1 /* left */ || alignButtons === 2 /* right */) {
                this.selectPreviousIndex();
            }
        };
        FileBar.prototype._renderTabButtons = function () {
            var _this = this;
            var _a = this.properties, files = _a.files, theme = _a.theme;
            return files.map(function (file, i) {
                var closeable = file.closeable, disabled = file.disabled, key = file.key, _a = file.label, label = _a === void 0 ? null : _a;
                return d_1.w(TabButton_1.default, {
                    // TODO: uncomment when TabButton published with https://github.com/dojo/widgets/pull/241
                    // callFocus: this._callTabFocus && i === this.properties.activeIndex,
                    active: i === _this.properties.activeIndex,
                    closeable: closeable,
                    controls: _this._id + "-tab-" + i,
                    disabled: disabled,
                    id: _this._id + "-tabbutton-" + i,
                    index: i,
                    key: key,
                    onClick: _this.selectIndex,
                    onCloseClick: _this.closeIndex,
                    onEndPress: _this.selectLastIndex,
                    // onFocusCalled: () => this._callTabFocus = false,
                    onHomePress: _this.selectFirstIndex,
                    onDownArrowPress: _this._onDownArrowPress,
                    onLeftArrowPress: _this._onLeftArrowPress,
                    onRightArrowPress: _this._onRightArrowPress,
                    onUpArrowPress: _this._onUpArrowPress,
                    theme: theme
                }, [label]);
            });
        };
        FileBar.prototype._validateIndex = function (currentIndex, backwards) {
            var files = this.properties.files;
            if (files.every(function (file) { return Boolean(file.disabled); })) {
                return null;
            }
            function nextIndex(index) {
                if (backwards) {
                    return (files.length + (index - 1)) % files.length;
                }
                return (index + 1) % files.length;
            }
            var i = !files[currentIndex] ? files.length - 1 : currentIndex;
            while (files[i].disabled) {
                i = nextIndex(i);
            }
            return i;
        };
        FileBar.prototype.closeIndex = function (index) {
            var onRequestTabClose = this.properties.onRequestTabClose;
            var file = this.properties.files[index];
            onRequestTabClose && onRequestTabClose(file, index);
        };
        FileBar.prototype.selectFirstIndex = function () {
            this.selectIndex(0, true);
        };
        FileBar.prototype.selectIndex = function (index, backwards) {
            var _a = this.properties, activeIndex = _a.activeIndex, onRequestTabChange = _a.onRequestTabChange;
            var validIndex = this._validateIndex(index, backwards);
            if (validIndex !== null && validIndex !== activeIndex) {
                var file = this.properties.files[validIndex];
                onRequestTabChange && onRequestTabChange(file, validIndex);
            }
        };
        FileBar.prototype.selectLastIndex = function () {
            this.selectIndex(this.properties.files.length - 1);
        };
        FileBar.prototype.selectNextIndex = function () {
            var activeIndex = this.properties.activeIndex;
            this.selectIndex(activeIndex === this.properties.files.length - 1 ? 0 : activeIndex + 1);
        };
        FileBar.prototype.selectPreviousIndex = function () {
            var activeIndex = this.properties.activeIndex;
            this.selectIndex(activeIndex === 0 ? this.properties.files.length - 1 : activeIndex - 1, true);
        };
        FileBar.prototype.render = function () {
            var activeIndex = this.properties.activeIndex;
            var validIndex = activeIndex;
            if (validIndex !== null && validIndex !== activeIndex) {
                this.selectIndex(validIndex);
                return null;
            }
            var children = [
                d_1.v('div', {
                    key: 'buttons',
                    classes: this.classes(css.tabButtons)
                }, this._renderTabButtons())
            ];
            var alignClass;
            var orientation = 'horizontal';
            switch (this.properties.alignButtons) {
                case 2 /* right */:
                    alignClass = css.alignRight;
                    orientation = 'vertical';
                    children.reverse();
                    break;
                case 0 /* bottom */:
                    alignClass = css.alignBottom;
                    children.reverse();
                    break;
                case 1 /* left */:
                    alignClass = css.alignLeft;
                    orientation = 'vertical';
                    break;
            }
            return d_1.v('div', {
                'aria-orientation': orientation,
                classes: this.classes(css.root, alignClass ? alignClass : null),
                role: 'tablist'
            }, children);
        };
        return FileBar;
    }(ThemeableBase));
    FileBar = __decorate([
        Themeable_1.theme(css)
    ], FileBar);
    exports.default = FileBar;
});
//# sourceMappingURL=FileBar.js.map