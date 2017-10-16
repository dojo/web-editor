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
        define(["require", "exports", "@dojo/core/lang", "@dojo/widget-core/d", "@dojo/widget-core/WidgetBase", "@dojo/widget-core/decorators/afterRender", "@dojo/widget-core/mixins/Themeable", "@dojo/widget-core/util/DomWrapper", "./styles/runner.m.css", "./support/base64", "./support/DOMParser", "./support/sourceMap"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var lang_1 = require("@dojo/core/lang");
    var d_1 = require("@dojo/widget-core/d");
    var WidgetBase_1 = require("@dojo/widget-core/WidgetBase");
    var afterRender_1 = require("@dojo/widget-core/decorators/afterRender");
    var Themeable_1 = require("@dojo/widget-core/mixins/Themeable");
    var DomWrapper_1 = require("@dojo/widget-core/util/DomWrapper");
    var css = require("./styles/runner.m.css");
    var base64 = require("./support/base64");
    var DOMParser_1 = require("./support/DOMParser");
    var sourceMap_1 = require("./support/sourceMap");
    /**
     * The semver for the `tslib` package, which provides the TypeScript helper functions
     */
    var TSLIB_SEMVER = '^1.6.0';
    /**
     * The default URI for the AMD loader to use when running a program
     */
    var DEFAULT_LOADER_URI = 'https://unpkg.com/@dojo/loader/loader.min.js';
    var DEFAULT_IFRAME_SRC = '../support/blank.html';
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
     * @return The generated HTML document
     */
    function docSrc(strings, scripts, css, bodyAttributes, html, loaderSrc, dependencies, packages, modules) {
        var paths = [];
        for (var pkg in dependencies) {
            paths.push("'" + pkg + "': 'https://unpkg.com/" + pkg + "@" + dependencies[pkg] + "'");
        }
        var pathsText = "{\n\t\t\t\t\t\t\t" + paths.join(',\n\t\t\t\t\t\t\t') + "\n\t\t\t\t\t\t}";
        var packagesText = "[\n\t\t\t\t\t\t\t" + packages.join(',\n\t\t\t\t\t\t\t') + "\n\t\t\t\t\t\t]";
        var modulesText = '';
        for (var mid in modules) {
            /* inject each source module as its own <script> block */
            var filename = mid + '.js';
            modulesText += '<script>';
            var source = sourceMap_1.wrapCode("cache['" + mid + "'] = function () {\n", modules[mid], '\n};\n');
            modulesText += source.code;
            /* if we have a sourcemap then we encode it and add it to the page */
            if (modules[mid].map) {
                var map = source.map.toJSON();
                map.file = filename;
                modulesText += "//# sourceMappingURL=data:application/json;base64," + base64.encode(JSON.stringify(map)) + "\n";
            }
            /* adding the sourceURL gives debuggers a "name" for this block of code */
            modulesText += "//# sourceURL=" + filename + "\n";
            modulesText += '</script>\n';
        }
        var cssText = css.map(function (_a) {
            var name = _a.name, text = _a.text;
            /* when external CSS is brought into a document, its URL URIs might not be encoded, this will encode them */
            var encoded = text.replace(/url\(['"]?(.*?)["']?\)/ig, function (match, p1) { return "url('" + encodeURI(p1) + "')"; });
            return "<style>\n" + encoded + "\n</style>";
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
     * Generate an HTML page which represents the Runner properties
     * @param param0 Properties from the Runner to be used to specify the document
     */
    function getSource(_a) {
        var _b = _a.css, css = _b === void 0 ? [] : _b, _c = _a.dependencies, dependencies = _c === void 0 ? {} : _c, _d = _a.loader, loader = _d === void 0 ? DEFAULT_LOADER_URI : _d, _e = _a.html, html = _e === void 0 ? '' : _e, _f = _a.modules, modules = _f === void 0 ? {} : _f;
        var _g = parseHtml(html), attributes = _g.attributes, body = _g.body, text = _g.css, scripts = _g.scripts;
        if (text) {
            css.unshift({ name: 'project index', text: text });
        }
        return (_h = ["<!DOCTYPE html>\n\t\t\t<html>\n\t\t\t<head>\n\t\t\t\t", "\n\t\t\t\t", "\n\t\t\t</head>\n\t\t\t<body", ">\n\t\t\t\t", "\n\t\t\t\t<script src=\"", "\"></script>\n\t\t\t\t<script>require.config({\n\tpaths: ", ",\n\tpackages: ", "\n});\n\nvar cache = {};\n//# sourceURL=web-editor/config.js\n\t\t\t\t</script>\n\t\t\t\t", "\n\t\t\t\t<script>require.cache(cache);\n/* workaround for dojo/loader#124 */\nrequire.cache({});\n\nrequire([ 'tslib', '@dojo/core/request', '../support/providers/amdRequire' ], function () {\n\tvar request = require('@dojo/core/request').default;\n\tvar getProvider = require('../support/providers/amdRequire').default;\n\trequest.setDefaultProvider(getProvider(require));\n\trequire([ 'src/main' ], function () { });\n});\n//# sourceURL=web-editor/bootstrap.js\n\t\t\t\t</script>\n\t\t\t</body>\n\t\t\t</html>"], _h.raw = ["<!DOCTYPE html>\n\t\t\t<html>\n\t\t\t<head>\n\t\t\t\t", "\n\t\t\t\t", "\n\t\t\t</head>\n\t\t\t<body", ">\n\t\t\t\t", "\n\t\t\t\t<script src=\"", "\"></script>\n\t\t\t\t<script>require.config({\n\tpaths: ", ",\n\tpackages: ", "\n});\n\nvar cache = {};\n//# sourceURL=web-editor/config.js\n\t\t\t\t</script>\n\t\t\t\t", "\n\t\t\t\t<script>require.cache(cache);\n/* workaround for dojo/loader#124 */\nrequire.cache({});\n\nrequire([ 'tslib', '@dojo/core/request', '../support/providers/amdRequire' ], function () {\n\tvar request = require('@dojo/core/request').default;\n\tvar getProvider = require('../support/providers/amdRequire').default;\n\trequest.setDefaultProvider(getProvider(require));\n\trequire([ 'src/main' ], function () { });\n});\n//# sourceURL=web-editor/bootstrap.js\n\t\t\t\t</script>\n\t\t\t</body>\n\t\t\t</html>"], docSrc(_h, scripts, css, attributes, body, loader, dependencies, getPackages(dependencies), modules));
        var _h;
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
        var attributes = {};
        for (var i = 0; i < doc.body.attributes.length; i++) {
            attributes[doc.body.attributes[i].name] = doc.body.attributes[i].value;
        }
        return {
            attributes: attributes,
            body: doc.body && doc.body.innerHTML || '',
            css: css.join('\n'),
            scripts: scripts
        };
    }
    /**
     * Write out the provided `source` to the target `iframe` and register an event listener for the `error` event on the `iframe`
     * @param iframe The `iframe` to have its document written to
     * @param source The document text to be written
     * @param errorListener The error listener that will be attached to the content window's error event
     */
    function writeIframeDoc(iframe, source, errorListener) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, new Promise(function (resolve, reject) {
                        function onLoadListener() {
                            iframe.removeEventListener('load', onLoadListener);
                            iframe.contentWindow.document.write(source);
                            iframe.contentWindow.document.close();
                            iframe.contentWindow.addEventListener('error', errorListener);
                            resolve();
                        }
                        iframe.contentWindow.removeEventListener('error', errorListener);
                        iframe.addEventListener('load', onLoadListener);
                        iframe.contentWindow.location.reload();
                    })];
            });
        });
    }
    var RunnerBase = Themeable_1.ThemeableMixin(WidgetBase_1.default);
    /**
     * A widget which will render its properties into a _runnable_ application within an `iframe`
     */
    var Runner = (function (_super) {
        __extends(Runner, _super);
        function Runner() {
            var _this = _super.call(this) || this;
            _this._onIframeError = function (evt) {
                evt.preventDefault();
                var onError = _this.properties.onError;
                onError && onError(evt.error);
            };
            _this._updating = false;
            var iframe = _this._iframe = document.createElement('iframe');
            iframe.setAttribute('src', DEFAULT_IFRAME_SRC);
            /* TODO: Remove when https://github.com/dojo/widget-core/issues/553 resolved */
            iframe.classList.add(css.iframe);
            _this._IframeDom = DomWrapper_1.default(iframe);
            _this.own(lang_1.createHandle(function () {
                if (iframe.contentWindow) {
                    iframe.contentWindow.removeEventListener('error', _this._onIframeError);
                }
            }));
            return _this;
        }
        Runner.prototype.updateSource = function (node) {
            var _this = this;
            if (this._updating) {
                return node;
            }
            if (this.properties.modules) {
                this._updating = true;
                var source = getSource(this.properties);
                writeIframeDoc(this._iframe, source, this._onIframeError)
                    .then(function () {
                    _this._updating = false;
                    var onRun = _this.properties.onRun;
                    onRun && onRun();
                });
            }
            return node;
        };
        Runner.prototype.render = function () {
            return d_1.v('div', {
                classes: this.classes(css.root)
            }, [d_1.w(this._IframeDom, {
                    key: 'runner',
                    src: this.properties.src || DEFAULT_IFRAME_SRC
                })]);
        };
        __decorate([
            afterRender_1.default()
        ], Runner.prototype, "updateSource", null);
        Runner = __decorate([
            Themeable_1.theme(css)
        ], Runner);
        return Runner;
    }(RunnerBase));
    exports.default = Runner;
});
//# sourceMappingURL=Runner.js.map