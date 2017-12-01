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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = y[op[0] & 2 ? "return" : op[0] ? "throw" : "next"]) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [0, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "@dojo/shim/Map", "@dojo/shim/object", "@dojo/widget-core/d", "@dojo/widget-core/WidgetBase", "./LiveCodeExample"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var Map_1 = require("@dojo/shim/Map");
    var object_1 = require("@dojo/shim/object");
    var d_1 = require("@dojo/widget-core/d");
    var WidgetBase_1 = require("@dojo/widget-core/WidgetBase");
    var LiveCodeExample_1 = require("./LiveCodeExample");
    var CHANGE_INTERVAL = 2000;
    function isLiveCodeExampleWNode(value) {
        return d_1.isWNode(value) && value.widgetConstructor === LiveCodeExample_1.default;
    }
    var editorMap = new Map_1.default();
    var LiveCodeController = /** @class */ (function (_super) {
        __extends(LiveCodeController, _super);
        function LiveCodeController() {
            var _this = _super !== null && _super.apply(this, arguments) || this;
            _this._onDirty = function (id) { return __awaiter(_this, void 0, void 0, function () {
                var project, data, _a;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            project = this.properties.project;
                            data = editorMap.get(id);
                            if (data) {
                                data.dirty = true;
                            }
                            _a = this;
                            return [4 /*yield*/, project.getProgram()];
                        case 1:
                            _a._program = _b.sent();
                            this.invalidate();
                            return [2 /*return*/];
                    }
                });
            }); };
            return _this;
        }
        LiveCodeController.prototype._setModel = function (data, id, text, tsx) {
            return __awaiter(this, void 0, void 0, function () {
                var project, name, _a;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            project = this.properties.project;
                            name = "./src/" + id + ".ts" + (tsx ? 'x' : '');
                            if (!!project.includes(name)) return [3 /*break*/, 2];
                            return [4 /*yield*/, project.addFile({
                                    type: 1 /* TypeScript */,
                                    name: name,
                                    text: text
                                })];
                        case 1:
                            _b.sent();
                            _b.label = 2;
                        case 2:
                            data.model = project.getFileModel(name);
                            _a = this;
                            return [4 /*yield*/, project.getProgram()];
                        case 3:
                            _a._program = _b.sent();
                            this.invalidate();
                            return [2 /*return*/];
                    }
                });
            });
        };
        LiveCodeController.prototype.render = function () {
            var _a = this, _program = _a._program, children = _a.children, runnerSrc = _a.properties.runnerSrc;
            for (var i = 0; i < children.length; i++) {
                var child = children[i];
                if (isLiveCodeExampleWNode(child)) {
                    var _b = child.properties, id = _b.id, tsx = _b.tsx;
                    if (!editorMap.has(id)) {
                        editorMap.set(id, { dirty: true });
                    }
                    var data = editorMap.get(id);
                    var model = data.model;
                    if (!model) {
                        var text = child.children
                            .filter(function (child) { return child !== null; })
                            .map(function (child) { return typeof child === 'object' ? child.text : child; })
                            .join('\n');
                        if (text) {
                            this._setModel(data, id, text, tsx);
                        }
                    }
                    var program = void 0;
                    if (model && _program && data.dirty) {
                        data.dirty = false;
                        program = _program;
                    }
                    object_1.assign(child.properties, {
                        changeInterval: CHANGE_INTERVAL,
                        model: model,
                        program: program,
                        runnerSrc: runnerSrc,
                        onDirty: this._onDirty
                    });
                }
            }
            return children;
        };
        return LiveCodeController;
    }(WidgetBase_1.default));
    exports.LiveCodeController = LiveCodeController;
    exports.default = LiveCodeController;
});
//# sourceMappingURL=LiveCodeController.js.map