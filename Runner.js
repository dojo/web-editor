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
        define(["require", "exports", "@dojo/core/Evented", "@dojo/core/lang", "./project", "./support/DOMParser"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var Evented_1 = require("@dojo/core/Evented");
    var lang_1 = require("@dojo/core/lang");
    var project_1 = require("./project");
    var DOMParser_1 = require("./support/DOMParser");
    var TSLIB_SEMVER = '^1.6.0';
    /**
     * A map of custom package data that needs to be added if this package is part of project that is being run
     */
    var PACKAGE_DATA = {
        cldrjs: "{ name: 'cldr', location: 'https://unpkg.com/cldrjs@<%SEMVER>/dist/cldr', main: '../cldr' }",
        globalize: "{ name: 'globalize', main: '/dist/globalize' }",
        maquette: "{ name: 'maquette', main: '/dist/maquette.min' }",
        pepjs: "{ name: 'pepjs', main: 'dist/pep' }",
        tslib: "{ name: 'tslib', location: 'https://unpkg.com/tslib@" + TSLIB_SEMVER + "/', main: 'tslib' }"
    };
    /**
     * Generate an HTML document source
     * @param strings Array of template strings
     * @param css The CSS as an array of strings
     * @param html The HTML to be used in the body of the document
     * @param dependencies A map of package dependencies required
     * @param modules Any modules to be injected into the page
     */
    function docSrc(strings, scripts, css, bodyAttributes, html, loaderSrc, dependencies, packages, modules) {
        var paths = [];
        for (var pkg in dependencies) {
            paths.push("'" + pkg + "': 'https://unpkg.com/" + pkg + "@" + dependencies[pkg] + "'");
        }
        var pathsText = "{\n\t\t\t\t\t\t\t" + paths.join(',\n\t\t\t\t\t\t\t') + "\n\t\t\t\t\t\t}";
        var packagesText = "[\n\t\t\t\t\t\t\t" + packages.join(',\n\t\t\t\t\t\t\t') + "\n\t\t\t\t\t\t]";
        var modulesText = "var cache = {\n";
        for (var mid in modules) {
            modulesText += "\t'" + mid + "': function () {\n" + modules[mid] + "\n},\n";
        }
        modulesText += "};\nrequire.cache(cache);\n/* workaround for dojo/loader#124 */\nrequire.cache({});\n";
        var cssText = css.map(function (_a) {
            var name = _a.name, text = _a.text;
            /* when external CSS is brought into a document, its URL URIs might not be encoded, this will encode them */
            var encoded = text.replace(/url\(['"]?(.*?)["']?\)/ig, function (match, p1) { return "url('" + encodeURI(p1) + "')"; });
            return "<style>\n/* from: " + name + " */\n\n" + encoded + "\n</style>";
        }).join('\n');
        var scriptsText = '';
        scripts.forEach(function (src) {
            scriptsText += "<script src=\"" + src + "\"></script>\n\t";
        });
        var bodyAttributesText = '';
        for (var attr in bodyAttributes) {
            bodyAttributesText += " " + attr + "=\"" + bodyAttributes[attr] + "\"";
        }
        var parts = [scriptsText, cssText, bodyAttributesText, html, loaderSrc, pathsText, packagesText, modulesText];
        var text = parts
            .reduce(function (previous, text, index) {
            return previous + strings[index] + text + '\n';
        }, '');
        return text + strings.slice(parts.length).join('\n');
    }
    /**
     * Return the information for packages based on dependencies for the project
     * @param dependencies The project dependencies
     */
    function getPackages(dependencies) {
        var packages = [];
        Object.keys(PACKAGE_DATA).forEach(function (key) {
            if (key in dependencies && key !== 'tslib') {
                packages.push(PACKAGE_DATA[key].replace('<%SEMVER>', dependencies[key]));
            }
        });
        packages.push(PACKAGE_DATA['tslib']); /* we are always going to inject this one */
        return packages;
    }
    /**
     * Determine if a string is a local or remote URI, returning `true` if remote, otherwise `false`
     * @param text string of text to check
     */
    function isRemoteURI(text) {
        var currenthost = window.location.protocol + "//" + window.location.hostname;
        if (text.indexOf(currenthost) >= 0) {
            return false;
        }
        return /^http(?:s)?:\/{2}/.test(text);
    }
    /**
     * Extract some specific content from an HTML document and return it
     * @param content The source HTML content
     */
    function parseHtml(content) {
        var parser = new DOMParser_1.default();
        var doc = parser.parseFromString(content, 'text/html');
        var scriptNodes = doc.querySelectorAll('script');
        var scripts = [];
        for (var i = 0; i < scriptNodes.length; i++) {
            var script = scriptNodes[i];
            script.parentElement && script.parentElement.removeChild(script);
            if (script.src && isRemoteURI(script.src)) {
                scripts.push(script.src);
            }
        }
        var css = [];
        var styles = doc.querySelectorAll('style');
        for (var i = 0; i < styles.length; i++) {
            var style = styles[i];
            if (style.textContent && style.getAttribute('scoped') === null) {
                css.push(style.textContent);
            }
        }
        return {
            css: css.join('\n'),
            body: doc.body && doc.body.innerHTML || '',
            scripts: scripts
        };
    }
    var Runner = (function (_super) {
        __extends(Runner, _super);
        /**
         * Create a runner instance attached to a specific `iframe`
         * @param iframe The `iframe` that should be used
         */
        function Runner(iframe) {
            var _this = _super.call(this) || this;
            /**
             * A private handler for re-emitting iframe errors
             * @param evt The iframe's contentWindow error event
             */
            _this._onIframeError = function (evt) {
                evt.preventDefault();
                _this.emit(evt);
            };
            _this._iframe = iframe;
            _this.own(lang_1.createHandle(function () {
                if (_this._iframe.contentWindow) {
                    _this._iframe.contentWindow.removeEventListener('error', _this._onIframeError);
                }
            }));
            return _this;
        }
        /**
         * Writes to the document of an `iframe`
         * @param iframe The target `iframe`
         * @param source The source to be written
         */
        Runner.prototype._writeIframeDoc = function (source) {
            return __awaiter(this, void 0, void 0, function () {
                var iframe, onIframeError;
                return __generator(this, function (_a) {
                    iframe = this._iframe;
                    onIframeError = this._onIframeError;
                    return [2 /*return*/, new Promise(function (resolve, reject) {
                            function onLoadListener() {
                                iframe.removeEventListener('load', onLoadListener);
                                iframe.contentWindow.document.write(source);
                                iframe.contentWindow.document.close();
                                iframe.contentWindow.addEventListener('error', onIframeError);
                                resolve();
                            }
                            iframe.contentWindow.removeEventListener('error', onIframeError);
                            iframe.addEventListener('load', onLoadListener);
                            iframe.contentWindow.location.reload();
                        })];
                });
            });
        };
        /**
         * Generate the document
         * @param param0 The options to use
         */
        Runner.prototype.getDoc = function (_a) {
            var _b = _a.css, css = _b === void 0 ? [] : _b, _c = _a.bodyAttributes, bodyAttributes = _c === void 0 ? {} : _c, dependencies = _a.dependencies, loaderSrc = _a.loaderSrc, _d = _a.html, html = _d === void 0 ? '' : _d, modules = _a.modules, _e = _a.scripts, scripts = _e === void 0 ? [] : _e;
            return (_f = ["<!DOCTYPE html>\n\t\t\t<html>\n\t\t\t<head>\n\t\t\t\t", "\n\t\t\t\t", "\n\t\t\t</head>\n\t\t\t<body", ">\n\t\t\t\t", "\n\t\t\t\t<script src=\"", "\"></script>\n\t\t\t\t<script>\n\t\t\t\t\trequire.config({\n\t\t\t\t\t\tpaths: ", ",\n\t\t\t\t\t\tpackages: ", "\n\t\t\t\t\t});\n\t\t\t\t\t", "\n\t\t\t\t\trequire([ 'tslib', '@dojo/core/request', '../support/providers/amdRequire' ], function () {\n\t\t\t\t\t\tvar request = require('@dojo/core/request').default;\n\t\t\t\t\t\tvar getProvider = require('../support/providers/amdRequire').default;\n\t\t\t\t\t\trequest.setDefaultProvider(getProvider(require));\n\t\t\t\t\t\trequire([ 'src/main' ], function () { });\n\t\t\t\t\t});\n\t\t\t\t</script>\n\t\t\t</body>\n\t\t\t</html>"], _f.raw = ["<!DOCTYPE html>\n\t\t\t<html>\n\t\t\t<head>\n\t\t\t\t", "\n\t\t\t\t", "\n\t\t\t</head>\n\t\t\t<body", ">\n\t\t\t\t", "\n\t\t\t\t<script src=\"", "\"></script>\n\t\t\t\t<script>\n\t\t\t\t\trequire.config({\n\t\t\t\t\t\tpaths: ", ",\n\t\t\t\t\t\tpackages: ", "\n\t\t\t\t\t});\n\t\t\t\t\t", "\n\t\t\t\t\trequire([ 'tslib', '@dojo/core/request', '../support/providers/amdRequire' ], function () {\n\t\t\t\t\t\tvar request = require('@dojo/core/request').default;\n\t\t\t\t\t\tvar getProvider = require('../support/providers/amdRequire').default;\n\t\t\t\t\t\trequest.setDefaultProvider(getProvider(require));\n\t\t\t\t\t\trequire([ 'src/main' ], function () { });\n\t\t\t\t\t});\n\t\t\t\t</script>\n\t\t\t</body>\n\t\t\t</html>"], docSrc(_f, scripts, css, bodyAttributes, html, loaderSrc, dependencies, getPackages(dependencies), modules));
            var _f;
        };
        /**
         * Get the emit from the current project and run it in the runner's `iframe`
         */
        Runner.prototype.run = function () {
            return __awaiter(this, void 0, void 0, function () {
                var program, modules, css, dependencies, _a, text, html, scripts, source;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            if (!project_1.default.isLoaded()) {
                                throw new Error('Project not loaded.');
                            }
                            return [4 /*yield*/, project_1.default.emit()];
                        case 1:
                            program = _b.sent();
                            modules = program
                                .filter(function (_a) {
                                var type = _a.type;
                                return type === 4 /* JavaScript */;
                            })
                                .reduce(function (map, _a) {
                                var name = _a.name, text = _a.text;
                                map[name.replace(/\.js$/, '')] = text;
                                return map;
                            }, {});
                            css = program
                                .filter(function (_a) {
                                var type = _a.type;
                                return type === 5 /* CSS */;
                            })
                                .map(function (_a) {
                                var name = _a.name, text = _a.text;
                                return { name: name, text: text };
                            });
                            dependencies = project_1.default.getDependencies();
                            _a = parseHtml(project_1.default.getIndexHtml()), text = _a.css, html = _a.body, scripts = _a.scripts;
                            if (text) {
                                css.unshift({ name: 'project index', text: text });
                            }
                            source = this.getDoc({
                                css: css,
                                html: html,
                                dependencies: dependencies,
                                loaderSrc: 'https://unpkg.com/@dojo/loader/loader.min.js',
                                modules: modules,
                                scripts: scripts
                            });
                            return [4 /*yield*/, this._writeIframeDoc(source)];
                        case 2:
                            _b.sent();
                            return [2 /*return*/];
                    }
                });
            });
        };
        return Runner;
    }(Evented_1.default));
    exports.default = Runner;
});
//# sourceMappingURL=Runner.js.map