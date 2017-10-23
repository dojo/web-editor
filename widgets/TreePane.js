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
        define(["require", "exports", "@dojo/shim/array", "@dojo/widget-core/d", "@dojo/widget-core/WidgetBase", "@dojo/widget-core/meta/Dimensions", "@dojo/widget-core/meta/Drag", "@dojo/widget-core/mixins/Themeable", "./ScrollBar", "../styles/treepane.m.css", "../styles/icons.m.css"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var array_1 = require("@dojo/shim/array");
    var d_1 = require("@dojo/widget-core/d");
    var WidgetBase_1 = require("@dojo/widget-core/WidgetBase");
    var Dimensions_1 = require("@dojo/widget-core/meta/Dimensions");
    var Drag_1 = require("@dojo/widget-core/meta/Drag");
    var Themeable_1 = require("@dojo/widget-core/mixins/Themeable");
    var ScrollBar_1 = require("./ScrollBar");
    var css = require("../styles/treepane.m.css");
    var iconCss = require("../styles/icons.m.css");
    var ROW_HEIGHT = 22;
    var ROW_LEVEL_LEFT_PADDING = 12;
    var ThemeableBase = Themeable_1.ThemeableMixin(WidgetBase_1.default);
    /**
     * The internal widget class which renders a row in the `TreePane`
     */
    var Row = /** @class */ (function (_super) {
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
            var _a = this, _onclick = _a._onclick, _ondblclick = _a._ondblclick, _b = _a.properties, rowClass = _b.class, expanded = _b.expanded, hasChildren = _b.hasChildren, label = _b.label, level = _b.level, selected = _b.selected, title = _b.title;
            var classes = [
                css.row,
                selected && css.selected || null,
                hasChildren && css.hasChildren || null,
                expanded && css.expanded || null
            ];
            return d_1.v('div', {
                'aria-level': String(level),
                'aria-selected': selected,
                classes: this.classes.apply(this, classes),
                role: 'treeitem',
                styles: {
                    'padding-left': String(level * ROW_LEVEL_LEFT_PADDING) + 'px'
                },
                onclick: _onclick,
                ondblclick: _ondblclick
            }, [
                d_1.v('div', {
                    classes: this.classes(css.content)
                }, [
                    d_1.v('div', {
                        classes: this.classes(css.label).fixed(iconCss.label, rowClass || null),
                        title: title
                    }, [
                        d_1.v('a', {
                            classes: this.classes(css.labelName)
                        }, [label])
                    ])
                ])
            ]);
        };
        Row = __decorate([
            Themeable_1.theme(css)
        ], Row);
        return Row;
    }(ThemeableBase));
    exports.Row = Row;
    /**
     * A widget class which takes a tree of items with a root specified as the `root` property and renders them into
     * a hierarchical set of rows, providing events that allow expansion/collapse of parent nodes, scrolling, and the
     * ability to _open_ nodes.
     */
    var TreePane = /** @class */ (function (_super) {
        __extends(TreePane, _super);
        function TreePane() {
            var _this = _super !== null && _super.apply(this, arguments) || this;
            _this._scrollPosition = 0;
            _this._scrollVisible = false;
            /**
             * Handler for the ScrollBar's higher order `onScroll` event.  This calls the `_onPosistionUpdate`.
             * @param delta The number of rows, positive or negative that have been scrolled
             */
            _this._onScrollbarScroll = function (delta) {
                _this._onPositionUpdate(delta);
            };
            return _this;
        }
        /**
         * Search the tree of items to find one item, in a BFS fashion
         * @param id The tree pane item ID to match
         */
        TreePane.prototype._findItem = function (id) {
            if (!this.properties.root) {
                return;
            }
            function find(id, item) {
                if (item.id === id) {
                    return item;
                }
                var children = item.children;
                if (children) {
                    for (var i = 0; i < children.length; i++) {
                        var search = find(id, children[i]);
                        if (search) {
                            return search;
                        }
                    }
                }
            }
            return find(id, this.properties.root);
        };
        /**
         * Determine how many rows are currently visible
         */
        TreePane.prototype._getVisibleRowCount = function () {
            return this.meta(Dimensions_1.default).get('rows').size.height / ROW_HEIGHT;
        };
        /**
         * Deal with keyboard navigation in the scroll area
         * @param evt The keyboard event
         */
        TreePane.prototype._onkeydown = function (evt) {
            var _a = this, _b = _a.properties, _c = _b.expanded, expanded = _c === void 0 ? [] : _c, onItemOpen = _b.onItemOpen, onItemSelect = _b.onItemSelect, onItemToggle = _b.onItemToggle, _d = _a._navigation, next = _d.next, previous = _d.previous, selected = _d.selected, start = _d.start, end = _d.end, selectedPosition = _d.selectedPosition;
            switch (evt.which) {
                case 40 /* Down */:/* Select Next Row */ 
                    if (next && onItemSelect) {
                        evt.preventDefault();
                        onItemSelect(next);
                        var visibleEnd = end - start - 4;
                        if (selectedPosition > visibleEnd) {
                            this._onPositionUpdate(Math.ceil(selectedPosition - visibleEnd));
                        }
                    }
                    break;
                case 38 /* Up */:/* Select Previous Row */ 
                    if (previous && onItemSelect) {
                        evt.preventDefault();
                        onItemSelect(previous);
                        if (selectedPosition < 2) {
                            this._onPositionUpdate(selectedPosition - 2);
                        }
                    }
                    break;
                case 37 /* Left */:/* Close a folder */ 
                    if (selected && array_1.includes(expanded, selected) && onItemToggle) {
                        evt.preventDefault();
                        onItemToggle(selected);
                    }
                    break;
                case 39 /* Right */:/* Open a folder */ 
                    if (selected) {
                        var item = this._findItem(selected);
                        if (item && item.children && !array_1.includes(expanded, selected) && onItemToggle) {
                            evt.preventDefault();
                            onItemToggle(selected);
                        }
                    }
                    break;
                case 13 /* Enter */:/* Open a folder or open an item */ 
                    if (selected && onItemOpen) {
                        evt.preventDefault();
                        onItemOpen(selected);
                    }
                    break;
            }
        };
        /**
         * Show the scrollbar
         * @param evt The mouse event
         */
        TreePane.prototype._onmouseenter = function (evt) {
            evt.preventDefault();
            this._scrollVisible = true;
            this.invalidate();
        };
        /**
         * Hide the scroll bar
         * @param evt The mouse event
         */
        TreePane.prototype._onmouseleave = function (evt) {
            evt.preventDefault();
            this._scrollVisible = false;
            this.invalidate();
        };
        /**
         * An internal higher order event that occurs when the top position of tree pane has changed, usually in response to a
         * scroll event.  The change is expressed in the number of rows moved, positive or negative.
         * @param delta The number of rows that have been scrolled
         * @returns `true` if the position was updated, otherwise `false`, which allows other methods to allow the tiggering
         *          event to bubble.
         */
        TreePane.prototype._onPositionUpdate = function (delta, invalidateOnChange) {
            if (invalidateOnChange === void 0) { invalidateOnChange = true; }
            var _a = this, _scrollPosition = _a._scrollPosition, _size = _a._size, _sliderSize = _a._sliderSize;
            var updatedPosition = _scrollPosition + delta;
            var maxPosition = _size - _sliderSize + 1;
            this._scrollPosition = updatedPosition > 0 ? updatedPosition > maxPosition ? maxPosition : updatedPosition : 0;
            if (_scrollPosition !== this._scrollPosition) {
                if (invalidateOnChange) {
                    this.invalidate();
                }
                return true;
            }
            return false;
        };
        /**
         * Handler for the row's higher order `onClick` event.  This fires the `onItemSelect` event.  If the item has children
         * then the `onItemToggle` is fired.  It also indicates to the widget that it should attempt to focus itself.
         * @param key The key of the item that has been clicked
         */
        TreePane.prototype._onRowClick = function (key) {
            this.properties.selected !== key && this.properties.onItemSelect && this.properties.onItemSelect(key);
            var item = this._findItem(key);
            if (!item) {
                throw new Error("Uncached TreePane row ID: \"" + key + "\"");
            }
            if (item.children && this.properties.onItemToggle) {
                this.properties.onItemToggle(key);
            }
        };
        /**
         * Handler for the row's higher order `onDblClick` event.  This fires the `onItemOpen` event.
         * @param key The key of the item that has been double clicked
         */
        TreePane.prototype._onRowDblClick = function (key) {
            this.properties.onItemOpen && this.properties.onItemOpen(key);
        };
        /**
         * Handler for the `onwheel` when there is a wheel event in the scroll area that calls the
         * `_onPositionUpdate`.
         * @param evt The WheelEvent
         */
        TreePane.prototype._onwheel = function (evt) {
            if (this._onPositionUpdate(evt.deltaY / ROW_HEIGHT)) {
                evt.preventDefault();
            }
        };
        /**
         * Return a `WNode<Row>` that represents a `TreePaneItem`
         * @param item The TreePaneItem to be rendered
         * @param level How deep in the hierarchy is the child
         */
        TreePane.prototype._renderChild = function (item, level) {
            var children = item.children, key = item.id, label = item.label, title = item.title;
            var navigation = this._navigation;
            var _a = this.properties, _b = _a.expanded, propsExpanded = _b === void 0 ? [] : _b, getItemClass = _a.getItemClass, selected = _a.selected, theme = _a.theme;
            var expanded = array_1.includes(propsExpanded, key);
            var hasChildren = Boolean(children);
            if (!navigation.selected) {
                if (selected === key) {
                    navigation.selected = key;
                }
                else {
                    navigation.previous = key;
                    navigation.selectedPosition++;
                }
            }
            else if (!navigation.next) {
                navigation.next = key;
            }
            return d_1.w(Row, {
                class: getItemClass && getItemClass(item, expanded),
                expanded: expanded,
                hasChildren: hasChildren,
                key: key,
                level: level,
                label: label,
                selected: selected === key,
                title: title,
                theme: theme,
                onClick: this._onRowClick,
                onDblClick: this._onRowDblClick
            });
        };
        /**
         * Flatten the `root` of the tree and determine which rows need to be rendered, return an array
         * of `(WNode<Row> | null)[]`.
         */
        TreePane.prototype._renderChildren = function (visibleRowCount) {
            var _this = this;
            this._navigation = {
                next: '',
                previous: '',
                selected: '',
                selectedPosition: 0,
                start: 0,
                end: 0
            };
            var _a = this, _navigation = _a._navigation, _scrollPosition = _a._scrollPosition, _b = _a.properties, _c = _b.expanded, expanded = _c === void 0 ? [] : _c, root = _b.root, showRoot = _b.showRoot;
            var children = [];
            var start = _navigation.start = _scrollPosition ? _scrollPosition - 1 : 0;
            var end = _navigation.end = start + visibleRowCount + 2;
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
        TreePane.prototype.render = function () {
            var _a = this, _onScrollbarScroll = _a._onScrollbarScroll, _scrollPosition = _a._scrollPosition, _scrollVisible = _a._scrollVisible, _b = _a.properties, key = _b.key, label = _b.label, theme = _b.theme;
            var delta = this.meta(Drag_1.default).get('rows').delta.y;
            if (delta) {
                this._onPositionUpdate((delta - (delta * 2)) / ROW_HEIGHT, false);
            }
            var top = 0 - (_scrollPosition % ROW_HEIGHT);
            var visibleRowCount = this._getVisibleRowCount();
            var rows = this._renderChildren(visibleRowCount);
            var sliderSize = this._sliderSize = visibleRowCount > rows.length ? rows.length : visibleRowCount;
            var size = this._size = rows.length;
            return d_1.v('div', {
                'aria-hidden': false,
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
                    tabIndex: 0,
                    onkeydown: this._onkeydown,
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
        TreePane = __decorate([
            Themeable_1.theme(css)
        ], TreePane);
        return TreePane;
    }(ThemeableBase));
    exports.default = TreePane;
});
//# sourceMappingURL=TreePane.js.map