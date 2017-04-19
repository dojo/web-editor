var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t;
    return { next: verb(0), "throw": verb(1), "return": verb(2) };
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
        define(["require", "exports", "./postcss", "./postcssCssnext", "./postcssModules"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var postcss_1 = require("./postcss");
    var postcssCssnext_1 = require("./postcssCssnext");
    var postcssModules_1 = require("./postcssModules");
    function classesToDefinition(classes) {
        return Object.keys(classes)
            .reduce(function (previous, className) {
            return previous + ("export const " + className + ": string;\n");
        }, '');
    }
    function classesToAMD(classes) {
        var result = Object.keys(classes)
            .map(function (className) { return "\t'" + className + "': '" + classes[className] + "'"; })
            .join(',\n');
        return "define([], function () {\n\t\treturn {\n\t\t" + result + "\n\t\t};\n\t});\n";
    }
    function getDefinitions() {
        var files = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            files[_i] = arguments[_i];
        }
        return __awaiter(this, void 0, void 0, function () {
            function getJSON(filename, json) {
                filename;
                mappedClasses = json;
            }
            var mappedClasses, processor, definitionFiles, i, file;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        processor = postcss_1.default([
                            postcssModules_1.default({ getJSON: getJSON })
                        ]);
                        definitionFiles = [];
                        i = 0;
                        _a.label = 1;
                    case 1:
                        if (!(i < files.length)) return [3 /*break*/, 4];
                        file = files[i];
                        mappedClasses = undefined;
                        return [4 /*yield*/, processor.process(file.text)];
                    case 2:
                        _a.sent();
                        if (mappedClasses) {
                            definitionFiles.push({
                                name: file.name + '.d.ts',
                                text: classesToDefinition(mappedClasses),
                                type: 2 /* Definition */
                            });
                        }
                        _a.label = 3;
                    case 3:
                        i++;
                        return [3 /*break*/, 1];
                    case 4: return [2 /*return*/, definitionFiles];
                }
            });
        });
    }
    exports.getDefinitions = getDefinitions;
    function getEmit() {
        var files = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            files[_i] = arguments[_i];
        }
        return __awaiter(this, void 0, void 0, function () {
            function getJSON(filename, json) {
                filename;
                mappedClasses = json;
            }
            var mappedClasses, processor, emitFiles, i, file, result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        processor = postcss_1.default([
                            postcssCssnext_1.default({
                                features: {
                                    autoprefixer: {
                                        browsers: ['last 2 versions', 'ie >= 11']
                                    }
                                }
                            }),
                            postcssModules_1.default({ getJSON: getJSON })
                        ]);
                        emitFiles = [];
                        i = 0;
                        _a.label = 1;
                    case 1:
                        if (!(i < files.length)) return [3 /*break*/, 4];
                        file = files[i];
                        mappedClasses = undefined;
                        return [4 /*yield*/, processor.process(file.text)];
                    case 2:
                        result = _a.sent();
                        emitFiles.push({
                            name: file.name,
                            text: result.css,
                            type: 5 /* CSS */
                        });
                        if (mappedClasses) {
                            emitFiles.push({
                                name: file.name + '.js',
                                text: classesToAMD(mappedClasses),
                                type: 4 /* JavaScript */
                            });
                        }
                        _a.label = 3;
                    case 3:
                        i++;
                        return [3 /*break*/, 1];
                    case 4: return [2 /*return*/, emitFiles];
                }
            });
        });
    }
    exports.getEmit = getEmit;
});
//# sourceMappingURL=css.js.map