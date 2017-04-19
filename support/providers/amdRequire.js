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
(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "@dojo/core/async/Task", "@dojo/core/request/providers/xhr", "@dojo/core/request/Headers", "@dojo/core/request/Response"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var Task_1 = require("@dojo/core/async/Task");
    var xhr_1 = require("@dojo/core/request/providers/xhr");
    var Headers_1 = require("@dojo/core/request/Headers");
    var Response_1 = require("@dojo/core/request/Response");
    var AMDRequireResponse = (function (_super) {
        __extends(AMDRequireResponse, _super);
        function AMDRequireResponse(url, response) {
            var _this = _super.call(this) || this;
            _this.bodyUsed = false;
            _this._response = response;
            _this.headers = new Headers_1.default();
            _this.ok = true;
            _this.status = 200;
            _this.statusText = 'OK';
            _this.url = require.toUrl(url);
            return _this;
        }
        AMDRequireResponse.prototype.arrayBuffer = function () {
            return Task_1.default.reject(new Error('ArrayBuffer not supported'));
        };
        AMDRequireResponse.prototype.blob = function () {
            return Task_1.default.reject(new Error('Blob not supported'));
        };
        AMDRequireResponse.prototype.formData = function () {
            return Task_1.default.reject(new Error('FormData not supported'));
        };
        AMDRequireResponse.prototype.json = function () {
            return Task_1.default.resolve(typeof this._response === 'string' ? JSON.parse(this._response) : this._response);
        };
        AMDRequireResponse.prototype.text = function () {
            return Task_1.default.resolve(typeof this._response === 'string' ? this._response : this._response && this._response.toString());
        };
        AMDRequireResponse.prototype.xml = function () {
            return Task_1.default.reject(new Error('XML not supported'));
        };
        return AMDRequireResponse;
    }(Response_1.default));
    exports.AMDRequireResponse = AMDRequireResponse;
    /**
     * When requesting local resources, use `require()` to retrieve them, assuming they have been made available as
     * modules in a bundle or pre-cached in the AMD loader.
     * @param url The URL to request
     * @param options Any request options
     */
    function amdRequire(url, options) {
        /* we need to detect and rewrite URLs from @dojo/i18n/cldr/load - see issue https://github.com/dojo/i18n/issues/83 */
        var i18nUri = /^https:\/\/unpkg\.com\/@dojo\/i18n[^\/]*\/cldr\//i;
        var remoteUri = /^https?:\/\//i;
        if (i18nUri.test(url) || !remoteUri.test(url)) {
            return new Task_1.default(function (resolve, reject) {
                var mid = url.replace(i18nUri, 'src/');
                try {
                    require([mid], function (module) { return resolve(new AMDRequireResponse(mid, module)); });
                }
                catch (e) {
                    reject(e);
                }
            });
        }
        return xhr_1.default(url, options);
    }
    exports.default = amdRequire;
});
//# sourceMappingURL=amdRequire.js.map