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
        define(["require", "exports", "@dojo/widget-core/d", "@dojo/widget-core/WidgetBase", "@dojo/widget-core/mixins/Themeable", "../styles/scrollbar.m.css", "./events"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var d_1 = require("@dojo/widget-core/d");
    var WidgetBase_1 = require("@dojo/widget-core/WidgetBase");
    var Themeable_1 = require("@dojo/widget-core/mixins/Themeable");
    var css = require("../styles/scrollbar.m.css");
    var events_1 = require("./events");
    var DEFAULT_KEY = 'scrollbar';
    var ThemeableBase = Themeable_1.ThemeableMixin(WidgetBase_1.default);
    /**
     * A class that provides a visualization of scrolling as well as emits events when the user interacts with
     * the scroll bar.  The properties of the scroll widget are relative, thereby not needing to translate from
     * the real DOM size of the scroll bar or scroll area it represents.
     */
    var ScrollBar = (function (_super) {
        __extends(ScrollBar, _super);
        function ScrollBar() {
            var _this = _super !== null && _super.apply(this, arguments) || this;
            _this._domSize = 0;
            _this._dragging = false;
            _this._visible = false;
            _this._fromRelative = function (relative) {
                var size = _this._getSize();
                return _this._domSize * (size ? relative / size : 0);
            };
            _this._toRelative = function (absolute) {
                var size = _this._getSize();
                return _this._domSize ? (absolute / _this._domSize) * size : 0;
            };
            _this._onSliderDragStart = function (evt) {
                evt.preventDefault();
                var horizontal = _this.properties.horizontal;
                _this._dragging = true;
                _this._dragPosition = events_1.getAbsolutePosition(evt, horizontal);
            };
            _this._onSliderDrag = function (evt) {
                var _a = _this, _dragging = _a._dragging, _dragPosition = _a._dragPosition, _b = _a.properties, horizontal = _b.horizontal, onScroll = _b.onScroll;
                if (_dragging) {
                    evt.preventDefault();
                    var delta = _this._toRelative(events_1.getAbsolutePosition(evt, horizontal) - _dragPosition);
                    onScroll && onScroll(delta);
                    _this._dragPosition = events_1.getAbsolutePosition(evt, horizontal);
                }
            };
            _this._onSliderDragStop = function (evt) {
                evt.preventDefault();
                _this._dragging = false;
            };
            return _this;
        }
        ScrollBar.prototype._getSize = function () {
            return this.properties.size || this._domSize;
        };
        ScrollBar.prototype._onDomUpdate = function (element, key) {
            var _a = this.properties, _b = _a.horizontal, horizontal = _b === void 0 ? false : _b, _c = _a.key, widgetKey = _c === void 0 ? DEFAULT_KEY : _c;
            if (key === widgetKey) {
                this._domSize = horizontal ? element.clientWidth : element.clientHeight;
            }
        };
        ScrollBar.prototype._onmouseenter = function (evt) {
            evt.preventDefault();
            if (!this._visible) {
                this._visible = true;
                this.invalidate();
            }
        };
        ScrollBar.prototype._onmouseleave = function (evt) {
            evt.preventDefault();
            if (this._visible) {
                this._visible = false;
                this.invalidate();
            }
        };
        ScrollBar.prototype.onElementCreated = function (element, key) {
            this._onDomUpdate(element, key);
        };
        ScrollBar.prototype.onElementUpdated = function (element, key) {
            this._onDomUpdate(element, key);
        };
        ScrollBar.prototype.render = function () {
            var _a = this.properties, _b = _a.horizontal, horizontal = _b === void 0 ? false : _b, _c = _a.key, key = _c === void 0 ? DEFAULT_KEY : _c, position = _a.position, _d = _a.size, size = _d === void 0 ? 0 : _d, _e = _a.sliderMin, sliderMin = _e === void 0 ? 10 : _e, _f = _a.sliderSize, sliderSize = _f === void 0 ? 0 : _f, propsVisible = _a.visible;
            var renderPosition = String(this._fromRelative(position)) + 'px';
            var relativeSliderSize = this._fromRelative(sliderSize);
            var renderSliderSize = String(relativeSliderSize > sliderMin ? relativeSliderSize : sliderMin) + 'px';
            var visible = sliderSize >= size ? false : propsVisible !== undefined ? propsVisible : this._visible;
            var styles = horizontal ? {
                left: renderPosition,
                width: renderSliderSize
            } : {
                top: renderPosition,
                height: renderSliderSize
            };
            return d_1.v('div', {
                classes: this.classes(css.root, css.vertical, visible ? css.visible : css.invisible),
                key: key,
                onmouseenter: this._onmouseenter,
                onmouseleave: this._onmouseleave
            }, [
                d_1.v('div', {
                    classes: this.classes(css.slider),
                    key: 'slider',
                    styles: styles,
                    onmousedown: this._onSliderDragStart,
                    onmousemove: this._onSliderDrag,
                    onmouseup: this._onSliderDragStop,
                    ontouchstart: this._onSliderDragStart,
                    ontouchmove: this._onSliderDrag,
                    ontouchend: this._onSliderDragStop
                })
            ]);
        };
        ScrollBar = __decorate([
            Themeable_1.theme(css)
        ], ScrollBar);
        return ScrollBar;
    }(ThemeableBase));
    exports.default = ScrollBar;
});
//# sourceMappingURL=ScrollBar.js.map