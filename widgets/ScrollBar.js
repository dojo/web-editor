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
        define(["require", "exports", "@dojo/widget-core/d", "@dojo/widget-core/meta/Dimensions", "@dojo/widget-core/meta/Drag", "@dojo/widget-core/meta/Matches", "@dojo/widget-core/WidgetBase", "@dojo/widget-core/mixins/Themed", "../styles/scrollbar.m.css"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var d_1 = require("@dojo/widget-core/d");
    var Dimensions_1 = require("@dojo/widget-core/meta/Dimensions");
    var Drag_1 = require("@dojo/widget-core/meta/Drag");
    var Matches_1 = require("@dojo/widget-core/meta/Matches");
    var WidgetBase_1 = require("@dojo/widget-core/WidgetBase");
    var Themed_1 = require("@dojo/widget-core/mixins/Themed");
    var scrollbarCss = require("../styles/scrollbar.m.css");
    var DEFAULT_KEY = 'root';
    var ThemedBase = Themed_1.ThemedMixin(WidgetBase_1.default);
    /**
     * Convert a relative number to an absolute number
     * @param relative The relative value to convert to an absolute value
     * @param relativeSize The relative size to compare with the abosolute size
     * @param absoluteSize The absolute size to compare with the relative size
     */
    function fromRelative(relative, relativeSize, absoluteSize) {
        return absoluteSize * (relativeSize ? relative / relativeSize : 0);
    }
    /**
     * Convert an absolute number to a relative number
     * @param absolute The absolute value to convert to a relative value
     * @param relativeSize The realtive size to compare with the absolute size
     * @param absoluteSize The absolute size to compare with the relative size
     */
    function toRelative(absolute, relativeSize, absoluteSize) {
        return absoluteSize ? (absolute / absoluteSize) * relativeSize : 0;
    }
    /**
     * A class that provides a visualization of scrolling as well as emits events when the user interacts with
     * the scroll bar.  The properties of the scroll widget are relative, thereby not needing to translate from
     * the real DOM size of the scroll bar or scroll area it represents.
     */
    var ScrollBar = /** @class */ (function (_super) {
        __extends(ScrollBar, _super);
        function ScrollBar() {
            var _this = _super !== null && _super.apply(this, arguments) || this;
            _this._visible = false;
            return _this;
        }
        /**
         * Returns the height or width of the scroll bar, depending on if it is horizontal or not
         */
        ScrollBar.prototype._getDomSize = function () {
            var _a = this.properties, horizontal = _a.horizontal, _b = _a.key, key = _b === void 0 ? DEFAULT_KEY : _b;
            var _c = this.meta(Dimensions_1.default).get("" + key).size, height = _c.height, width = _c.width;
            return horizontal ? width : height;
        };
        /**
         * Determine if the scroll bar node is being clicked and if so, call the scroll listener with the relative position
         * that is attempted to be navigated to.
         * @param event The mouse event
         */
        ScrollBar.prototype._onclick = function (event) {
            var _a = this.properties.key, key = _a === void 0 ? DEFAULT_KEY : _a;
            if (this.meta(Matches_1.default).get("" + key, event)) {
                event.preventDefault();
                var domSize = this._getDomSize();
                var _b = this.properties, horizontal = _b.horizontal, position = _b.position, _c = _b.size, size = _c === void 0 ? domSize : _c, _d = _b.sliderMin, sliderMin = _d === void 0 ? 10 : _d, sliderSize = _b.sliderSize, onScroll = _b.onScroll;
                var absoluteDelta = (horizontal ? event.offsetX : event.offsetY) -
                    (fromRelative(position, size, domSize) +
                        ((sliderSize ? fromRelative(sliderSize, size, domSize) : sliderMin) / 2));
                onScroll(toRelative(absoluteDelta, size, domSize));
            }
        };
        /**
         * Set the visible state to true if the mouse is hovering over the scroll bar
         * @param event The pointer event
         */
        ScrollBar.prototype._onpointerenter = function (event) {
            event.preventDefault();
            if (!this._visible) {
                this._visible = true;
                this.invalidate();
            }
        };
        /**
         * Set the visible state to false if the mouse has moved away from the scroll bar
         * @param event The pointer event
         */
        ScrollBar.prototype._onpointerleave = function (event) {
            event.preventDefault();
            if (this._visible) {
                this._visible = false;
                this.invalidate();
            }
        };
        ScrollBar.prototype.render = function () {
            var domSize = this._getDomSize();
            var _a = this.properties, _b = _a.horizontal, horizontal = _b === void 0 ? false : _b, _c = _a.key, key = _c === void 0 ? DEFAULT_KEY : _c, position = _a.position, _d = _a.size, size = _d === void 0 ? domSize : _d, _e = _a.sliderMin, sliderMin = _e === void 0 ? 10 : _e, _f = _a.sliderSize, sliderSize = _f === void 0 ? 0 : _f, propsVisible = _a.visible, onScroll = _a.onScroll;
            var dragging = false;
            var dragResult = this.meta(Drag_1.default).get('slider');
            var delta = horizontal ? dragResult.delta.x : dragResult.delta.y;
            dragging = dragResult.isDragging;
            delta && onScroll(toRelative(delta, size, domSize));
            var renderPosition = fromRelative(position, size, domSize) + "px";
            var absoluteSliderSize = fromRelative(sliderSize, size, domSize);
            var renderSliderSize = (absoluteSliderSize > sliderMin ? absoluteSliderSize : sliderMin) + "px";
            var visible = sliderSize >= size ? false : propsVisible !== undefined ? propsVisible : this._visible;
            var styles = (_g = {},
                _g[horizontal ? 'left' : 'top'] = renderPosition,
                _g[horizontal ? 'width' : 'height'] = renderSliderSize,
                _g);
            return d_1.v('div', {
                classes: this.theme([
                    scrollbarCss.root,
                    horizontal ? scrollbarCss.horizontal : scrollbarCss.vertical,
                    visible || dragging ? scrollbarCss.visible : scrollbarCss.invisible
                ]).concat([
                    scrollbarCss.rootFixed,
                    horizontal ? scrollbarCss.horizontalFixed : scrollbarCss.verticalFixed,
                    visible || dragging ? scrollbarCss.visibleFixed : scrollbarCss.invisibleFixed
                ]),
                key: key,
                onclick: this._onclick,
                onpointerenter: this._onpointerenter,
                onpointerleave: this._onpointerleave
            }, [
                d_1.v('div', {
                    classes: this.theme([scrollbarCss.slider, dragging ? scrollbarCss.dragging : null]).concat([
                        scrollbarCss.sliderFixed
                    ]),
                    key: 'slider',
                    styles: styles
                })
            ]);
            var _g;
        };
        ScrollBar = __decorate([
            Themed_1.theme(scrollbarCss)
        ], ScrollBar);
        return ScrollBar;
    }(ThemedBase));
    exports.default = ScrollBar;
});
//# sourceMappingURL=ScrollBar.js.map