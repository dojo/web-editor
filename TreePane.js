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
        define(["require", "exports", "@dojo/shim/array", "@dojo/shim/Map", "@dojo/widget-core/d", "@dojo/widget-core/WidgetBase", "@dojo/widget-core/mixins/Themeable", "./ScrollBar", "./styles/treepane.m.css", "./support/events", "./support/icons"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var array_1 = require("@dojo/shim/array");
    var Map_1 = require("@dojo/shim/Map");
    var d_1 = require("@dojo/widget-core/d");
    var WidgetBase_1 = require("@dojo/widget-core/WidgetBase");
    var Themeable_1 = require("@dojo/widget-core/mixins/Themeable");
    var ScrollBar_1 = require("./ScrollBar");
    var css = require("./styles/treepane.m.css");
    var events_1 = require("./support/events");
    var icons_1 = require("./support/icons");
    var ROW_HEIGHT = 22;
    var ThemeableBase = Themeable_1.ThemeableMixin(WidgetBase_1.default);
    var ROW_LEVEL_LEFT_PADDING = 12;
    var Row = (function (_super) {
        __extends(Row, _super);
        function Row() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        Row.prototype._onclick = function () {
            this.properties.onClick && this.properties.onClick(this.properties.key);
        };
        Row.prototype._ondblclick = function () {
            this.properties.onDblClick && this.properties.onDblClick(this.properties.key);
        };
        Row.prototype.render = function () {
            var classes = [css.row, this.properties.selected && css.selected || null, this.properties.hasChildren && css.hasChildren || null, this.properties.expanded && css.expanded || null];
            return d_1.v('div', {
                'aria-level': String(this.properties.level),
                'aria-selected': this.properties.selected,
                'aria-role': 'treeitem',
                classes: this.classes.apply(this, classes),
                role: 'treeitem',
                styles: {
                    'padding-left': String(this.properties.level * ROW_LEVEL_LEFT_PADDING) + 'px'
                },
                onclick: this._onclick,
                ondblclick: this._ondblclick
            }, [
                d_1.v('div', {
                    classes: this.classes(css.content)
                }, [
                    d_1.v('div', {
                        classes: this.classes(css.label).fixed(css.labelFixed, this.properties.class || null),
                        title: this.properties.title
                    }, [
                        d_1.v('a', {
                            classes: this.classes(css.labelName)
                        }, [this.properties.label])
                    ])
                ])
            ]);
        };
        return Row;
    }(ThemeableBase));
    Row = __decorate([
        Themeable_1.theme(css)
    ], Row);
    exports.Row = Row;
    var TreePane = (function (_super) {
        __extends(TreePane, _super);
        function TreePane() {
            var _this = _super !== null && _super.apply(this, arguments) || this;
            _this._dragging = false;
            _this._items = new Map_1.default();
            _this._scrollPosition = 0;
            _this._scrollVisible = false;
            _this._onScrollbarScroll = function (delta) {
                _this._onPositionUpdate(delta);
            };
            return _this;
        }
        TreePane.prototype._cacheItems = function () {
            function cacheItem(cache, item) {
                cache.set(item.id, item);
                if (item.children) {
                    item.children.forEach(function (child) { return cacheItem(cache, child); });
                }
            }
            if (this.properties.root) {
                this._items.clear();
                cacheItem(this._items, this.properties.root);
            }
        };
        TreePane.prototype._onDomUpdate = function (element, key) {
            if (key === 'rows') {
                this._visibleRowCount = element.clientHeight / ROW_HEIGHT;
            }
        };
        TreePane.prototype._onDragStart = function (evt) {
            evt.preventDefault();
            this._dragging = true;
            this._dragPosition = events_1.getAbsolutePosition(evt);
        };
        TreePane.prototype._onDragMove = function (evt) {
            var _a = this, _dragging = _a._dragging, _dragPosition = _a._dragPosition;
            if (_dragging) {
                evt.preventDefault();
                var delta = events_1.getAbsolutePosition(evt) - _dragPosition;
                this._onPositionUpdate(delta / ROW_HEIGHT);
                this._dragPosition = events_1.getAbsolutePosition(evt);
            }
        };
        TreePane.prototype._onDragEnd = function (evt) {
            evt.preventDefault();
            this._dragging = false;
        };
        TreePane.prototype._onmouseenter = function (evt) {
            evt.preventDefault();
            this._scrollVisible = true;
            this.invalidate();
        };
        TreePane.prototype._onmouseleave = function (evt) {
            evt.preventDefault();
            this._scrollVisible = false;
            this.invalidate();
        };
        TreePane.prototype._onPositionUpdate = function (delta) {
            var _a = this, _scrollPosition = _a._scrollPosition, _size = _a._size, _sliderSize = _a._sliderSize;
            var updatedPosition = _scrollPosition + delta;
            var maxPosition = _size - _sliderSize + 1;
            this._scrollPosition = updatedPosition > 0 ? updatedPosition > maxPosition ? maxPosition : updatedPosition : 0;
            if (_scrollPosition !== this._scrollPosition) {
                this.invalidate();
                return true;
            }
            return false;
        };
        TreePane.prototype._onRowClick = function (key) {
            this.properties.selected !== key && this.properties.onItemSelect && this.properties.onItemSelect(key);
            var item = this._items.get(key);
            if (!item) {
                throw new Error("Uncached TreePane row ID: \"" + key + "\"");
            }
            if (item.children && this.properties.onItemToggle) {
                this.properties.onItemToggle(key);
            }
        };
        TreePane.prototype._onRowDblClick = function (key) {
            this.properties.onItemOpen && this.properties.onItemOpen(key);
        };
        TreePane.prototype._onwheel = function (evt) {
            if (this._onPositionUpdate(evt.deltaY / ROW_HEIGHT)) {
                evt.preventDefault();
            }
        };
        TreePane.prototype._renderChild = function (item, level) {
            var children = item.children, key = item.id, label = item.label, title = item.title;
            var _a = this.properties, propsExpanded = _a.expanded, theme = _a.theme;
            var expanded = array_1.includes(propsExpanded, key);
            var hasChildren = Boolean(children);
            return d_1.w(Row, {
                class: hasChildren ? this._resolver.folder(label, expanded) : this._resolver.file(label),
                expanded: expanded,
                hasChildren: hasChildren,
                key: key,
                level: level,
                label: label,
                selected: this.properties.selected === key,
                title: title,
                theme: theme,
                onClick: this._onRowClick,
                onDblClick: this._onRowDblClick
            });
        };
        TreePane.prototype._renderChildren = function () {
            var _this = this;
            var _a = this, _scrollPosition = _a._scrollPosition, _b = _a.properties, expanded = _b.expanded, root = _b.root, showRoot = _b.showRoot;
            var children = [];
            var start = _scrollPosition ? _scrollPosition - 1 : 0;
            var end = start + this._visibleRowCount + 2;
            var rowCount = 0;
            var addChildren = function (items, level) {
                items.forEach(function (item) {
                    rowCount++;
                    children.push(rowCount >= start && rowCount <= end ? _this._renderChild(item, level) : null);
                    if (item.children && item.children.length && array_1.includes(expanded, item.id)) {
                        addChildren(item.children, level + 1);
                    }
                });
            };
            if (root) {
                addChildren(showRoot ? [root] : root.children || [], 1);
            }
            return children;
        };
        TreePane.prototype.onElementCreated = function (element, key) {
            this._onDomUpdate(element, key);
        };
        TreePane.prototype.onElementUpdated = function (element, key) {
            this._onDomUpdate(element, key);
        };
        TreePane.prototype.render = function () {
            var _a = this, _onScrollbarScroll = _a._onScrollbarScroll, _resolver = _a._resolver, _scrollPosition = _a._scrollPosition, _scrollVisible = _a._scrollVisible, _b = _a.properties, icons = _b.icons, key = _b.key, label = _b.label, sourcePath = _b.sourcePath, theme = _b.theme, _visibleRowCount = _a._visibleRowCount;
            if (!_resolver && icons && sourcePath) {
                this._resolver = new icons_1.IconResolver(sourcePath, icons);
            }
            this._cacheItems();
            var top = 0 - (_scrollPosition % ROW_HEIGHT);
            var rows = this._renderChildren();
            var sliderSize = this._sliderSize = _visibleRowCount > rows.length ? rows.length : _visibleRowCount;
            var size = this._size = rows.length;
            return d_1.v('div', {
                'aria-label': label,
                classes: this.classes(css.root),
                key: key,
                role: 'tree',
                onmouseenter: this._onmouseenter,
                onmouseleave: this._onmouseleave
            }, [
                d_1.v('div', {
                    classes: this.classes(css.scroll),
                    key: 'rows',
                    role: 'presentation',
                    styles: {
                        top: String(top) + 'px'
                    },
                    onmousedown: this._onDragStart,
                    onmousemove: this._onDragMove,
                    onmouseup: this._onDragEnd,
                    ontouchstart: this._onDragStart,
                    ontouchmove: this._onDragMove,
                    ontouchend: this._onDragEnd,
                    onwheel: this._onwheel
                }, rows),
                d_1.w(ScrollBar_1.default, {
                    position: _scrollPosition,
                    size: size,
                    sliderSize: sliderSize,
                    visible: _scrollVisible,
                    theme: theme,
                    onScroll: _onScrollbarScroll
                })
            ]);
        };
        return TreePane;
    }(ThemeableBase));
    TreePane = __decorate([
        Themeable_1.theme(css)
    ], TreePane);
    exports.default = TreePane;
});
//# sourceMappingURL=TreePane.js.map