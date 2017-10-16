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
        define(["require", "exports", "./URL", "@dojo/core/global", "@dojo/core/request"], factory);
    }
})(function (require, exports) {
    "use strict";
    '!has("url-api")';
    Object.defineProperty(exports, "__esModule", { value: true });
    require("./URL");
    var global_1 = require("@dojo/core/global");
    var request_1 = require("@dojo/core/request");
    var globalURL = global_1.default.window.URL;
    var IconResolver = (function () {
        function IconResolver(sourcePath, config) {
            this._config = config;
            this._sourcePath = (new globalURL(sourcePath, window.location.toString()).toString());
        }
        /**
         * Get the class name for an icon based on the folder name and if it is expanded or not
         * @param name The name of the folder
         * @param expanded If the expanded version of the icon should be used.  Defaults to `false`.
         */
        IconResolver.prototype.folder = function (name, expanded) {
            if (expanded === void 0) { expanded = false; }
            if (!expanded && name in this._config.folderNames) {
                return this._config.folderNames[name];
            }
            if (expanded && name in this._config.folderNamesExpanded) {
                return this._config.folderNamesExpanded[name];
            }
            return expanded ? this._config.folderExpanded : this._config.folder;
        };
        /**
         * Get the class name for an icon based on the filename and optionally language.
         * @param name The name of the file
         * @param language An optional language which would override the extension.
         */
        IconResolver.prototype.file = function (name, language) {
            if (language === void 0) { language = ''; }
            if (name in this._config.fileNames) {
                return this._config.fileNames[name];
            }
            if (language && language in this._config.languageIds) {
                return this._config.languageIds[language];
            }
            var extensions = name.split('.');
            extensions.shift();
            while (extensions.length) {
                var current = extensions.join('.');
                if (current in this._config.fileExtensions) {
                    return this._config.fileExtensions[current];
                }
                extensions.shift();
            }
            return this._config.file;
        };
        /**
         * Resolve the URL for a given icon name
         * @param iconName The icon name to return a URL for
         */
        IconResolver.prototype.iconUrl = function (iconName) {
            var iconPath = this._config.iconDefinitions[iconName] && this._config.iconDefinitions[iconName].iconPath;
            if (!iconPath) {
                throw new TypeError("Icon named \"" + iconName + "\" not found.");
            }
            return new globalURL(iconPath, this._sourcePath).toString();
        };
        return IconResolver;
    }());
    exports.IconResolver = IconResolver;
    /**
     * Load the JSON data from a file for icons and return an instance of an icon resolver which is bound to the data from
     * the configuration file.
     * @param filename The filename of the JSON configuration for the icons.
     */
    function load(filename) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, request_1.default(filename)];
                    case 1: return [2 /*return*/, (_a.sent()).json()];
                }
            });
        });
    }
    exports.load = load;
});
//# sourceMappingURL=icons.js.map