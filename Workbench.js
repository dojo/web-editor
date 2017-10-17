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
        define(["require", "exports", "@dojo/shim/array", "@dojo/shim/object", "@dojo/widget-core/d", "@dojo/widget-core/mixins/Themeable", "@dojo/widget-core/WidgetBase", "./Editor", "./IconCss", "./Runner", "./TreePane", "./support/icons", "./styles/treepane.m.css", "./styles/workbench.m.css"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var array_1 = require("@dojo/shim/array");
    var object_1 = require("@dojo/shim/object");
    var d_1 = require("@dojo/widget-core/d");
    var Themeable_1 = require("@dojo/widget-core/mixins/Themeable");
    var WidgetBase_1 = require("@dojo/widget-core/WidgetBase");
    var Editor_1 = require("./Editor");
    var IconCss_1 = require("./IconCss");
    var Runner_1 = require("./Runner");
    var TreePane_1 = require("./TreePane");
    var icons_1 = require("./support/icons");
    var treepaneCss = require("./styles/treepane.m.css");
    var css = require("./styles/workbench.m.css");
    var ThemeableBase = Themeable_1.ThemeableMixin(WidgetBase_1.default);
    var Workbench = (function (_super) {
        __extends(Workbench, _super);
        function Workbench() {
            var _this = _super !== null && _super.apply(this, arguments) || this;
            _this._expanded = ['/', '/src'];
            _this._iconResolver = new icons_1.IconResolver();
            _this._getItemClass = function (item, expanded) {
                if (typeof item.label === 'string') {
                    return item.children && item.children.length ? _this._iconResolver.folder(item.label, expanded) : _this._iconResolver.file(item.label);
                }
            };
            return _this;
        }
        Workbench.prototype._getTreeRoot = function () {
            /**
             * Add a file to a tree of files, by parsing the filename and adding generating a `TreePaneItem`
             * @param root The root to add the file to
             * @param filename The full path of the filename
             */
            function addFile(root, filename) {
                var endsWithPathMarker = /[\/\\]$/.test(filename);
                var parts = filename.split(/[\/\\]/);
                var deliminator = filename.split('/').length === parts.length ? '/' : '\\';
                var idParts = [];
                if (parts[0] === '.') {
                    idParts.push(parts.shift());
                    if (root.id === '') {
                        root = {
                            children: [],
                            id: '.',
                            label: '.',
                            title: '.'
                        };
                    }
                }
                var parent = root;
                var _loop_1 = function () {
                    var currentPart = parts[0];
                    if (!parent.children) {
                        parent.children = [];
                    }
                    var item = array_1.find(parent.children, function (child) { return child.label === currentPart; });
                    if (!item) {
                        item = {
                            id: idParts.concat(currentPart).join(deliminator),
                            label: currentPart,
                            title: idParts.concat(currentPart).join(deliminator)
                        };
                        parent.children.push(item);
                    }
                    parent = item;
                    idParts.push(parts.shift());
                };
                while (parts.length) {
                    _loop_1();
                }
                if (endsWithPathMarker && !parent.children) {
                    parent.children = [];
                }
                return root;
            }
            var files = this.properties.files;
            if (files) {
                return files
                    .sort(function (a, b) { return a < b ? -1 : 1; })
                    .reduce(function (previous, current) { return addFile(previous, current); }, {
                    id: '',
                    label: '',
                    title: ''
                });
            }
        };
        Workbench.prototype._onItemOpen = function (id) {
            this._selected = id;
            var onFileOpen = this.properties.onFileOpen;
            onFileOpen && onFileOpen(id);
            this.invalidate();
        };
        Workbench.prototype._onItemSelect = function (id) {
            this._selected = id;
            this.invalidate();
        };
        Workbench.prototype._onItemToggle = function (id) {
            var _expanded = this._expanded;
            if (array_1.includes(_expanded, id)) {
                _expanded.splice(_expanded.indexOf(id), 1);
            }
            else {
                _expanded.push(id);
            }
            this.invalidate();
        };
        Workbench.prototype.render = function () {
            var _a = this, _expanded = _a._expanded, getItemClass = _a._getItemClass, selected = _a._selected, _b = _a.properties, filename = _b.filename, icons = _b.icons, sourcePath = _b.iconsSourcePath, program = _b.program, theme = _b.theme, onRun = _b.onRun;
            if (icons && sourcePath) {
                this._iconResolver.setProperties({ icons: icons, sourcePath: sourcePath });
            }
            var runnerProperties = object_1.assign({}, program, { key: 'runner', theme: theme, onRun: onRun });
            return d_1.v('div', {
                classes: this.classes(css.root)
            }, [
                d_1.w(IconCss_1.default, {
                    baseClass: treepaneCss.labelFixed,
                    icons: icons,
                    key: 'icons',
                    sourcePath: sourcePath
                }),
                d_1.v('div', {
                    classes: this.classes(css.filetree)
                }, [
                    d_1.w(TreePane_1.default, {
                        expanded: _expanded.slice(),
                        getItemClass: getItemClass,
                        key: 'treepane',
                        root: this._getTreeRoot(),
                        selected: selected,
                        theme: theme,
                        onItemOpen: this._onItemOpen,
                        onItemSelect: this._onItemSelect,
                        onItemToggle: this._onItemToggle
                    })
                ]),
                d_1.w(Editor_1.default, {
                    filename: filename,
                    key: 'editor',
                    options: {
                        minimap: { enabled: false }
                    },
                    theme: theme
                }),
                d_1.w(Runner_1.default, runnerProperties)
            ]);
        };
        Workbench = __decorate([
            Themeable_1.theme(css)
        ], Workbench);
        return Workbench;
    }(ThemeableBase));
    exports.default = Workbench;
});
//# sourceMappingURL=Workbench.js.map