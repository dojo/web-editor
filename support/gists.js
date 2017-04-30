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
        define(["require", "exports", "@dojo/core/request", "@dojo/core/async/Task"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var request_1 = require("@dojo/core/request");
    var Task_1 = require("@dojo/core/async/Task");
    var API_GITHUB = 'https://api.github.com/';
    var GIST_REPLACEMENT_HOST = 'rawgit.com';
    var GIST_SOURCE_HOST = 'gist.githubusercontent.com';
    function getById(id) {
        return __awaiter(this, void 0, Task_1.default, function () {
            var response, _a, description, files, key, file;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, request_1.default.get(API_GITHUB + "gists/" + id)];
                    case 1:
                        response = _b.sent();
                        return [4 /*yield*/, response.json()];
                    case 2:
                        _a = _b.sent(), description = _a.description, files = _a.files;
                        for (key in files) {
                            file = files[key];
                            if (file.filename.toLowerCase() === 'project.json' && file.type === 'application/json') {
                                return [2 /*return*/, {
                                        description: description,
                                        projectJson: file['raw_url'].replace(GIST_SOURCE_HOST, GIST_REPLACEMENT_HOST)
                                    }];
                            }
                        }
                        return [2 /*return*/];
                }
            });
        });
    }
    exports.getById = getById;
    /**
     * Return an array of objects which describe gists that contain `project.json` files that can be loaded
     * @param username The GitHub username to retrieve the gists for
     */
    function getByUsername(username) {
        return __awaiter(this, void 0, Task_1.default, function () {
            var response, gists;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, request_1.default.get(API_GITHUB + "users/" + username + "/gists")];
                    case 1:
                        response = _a.sent();
                        return [4 /*yield*/, response.json()];
                    case 2:
                        gists = _a.sent();
                        return [2 /*return*/, gists
                                .filter(function (gist) {
                                for (var key in gist.files) {
                                    return gist.files[key].type === 'application/json' && gist.files[key].filename.toLowerCase() === 'project.json';
                                }
                            })
                                .map(function (gist) {
                                var projectJson = '';
                                for (var key in gist.files) {
                                    var file = gist.files[key];
                                    if (file.type === 'application/json' && file.filename.toLowerCase() === 'project.json') {
                                        projectJson = file['raw_url'].replace(GIST_SOURCE_HOST, GIST_REPLACEMENT_HOST);
                                    }
                                }
                                return {
                                    description: gist.description,
                                    id: gist.id,
                                    projectJson: projectJson
                                };
                            })];
                }
            });
        });
    }
    exports.getByUsername = getByUsername;
});
//# sourceMappingURL=gists.js.map