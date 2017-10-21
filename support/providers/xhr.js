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
        define(["require", "exports", "@dojo/shim/iterator", "@dojo/shim/WeakMap", "@dojo/core/async/Task", "@dojo/core/global", "@dojo/core/has", "@dojo/core/util", "@dojo/core/request/Headers", "@dojo/core/request/Response", "@dojo/core/request/TimeoutError", "@dojo/core/request/util", "@dojo/core/Observable", "@dojo/core/request/SubscriptionPool"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var iterator_1 = require("@dojo/shim/iterator");
    var WeakMap_1 = require("@dojo/shim/WeakMap");
    var Task_1 = require("@dojo/core/async/Task");
    var global_1 = require("@dojo/core/global");
    var has_1 = require("@dojo/core/has");
    var util_1 = require("@dojo/core/util");
    var Headers_1 = require("@dojo/core/request/Headers");
    var Response_1 = require("@dojo/core/request/Response");
    var TimeoutError_1 = require("@dojo/core/request/TimeoutError");
    var util_2 = require("@dojo/core/request/util");
    var Observable_1 = require("@dojo/core/Observable");
    var SubscriptionPool_1 = require("@dojo/core/request/SubscriptionPool");
    var dataMap = new WeakMap_1.default();
    function getDataTask(response) {
        var data = dataMap.get(response);
        if (data.used) {
            return Task_1.default.reject(new TypeError('Body already read'));
        }
        data.used = true;
        return data.task;
    }
    /**
     * Wraps an XHR request in a response that mimics the fetch API
     */
    var XhrResponse = /** @class */ (function (_super) {
        __extends(XhrResponse, _super);
        function XhrResponse(request) {
            var _this = _super.call(this) || this;
            var headers = _this.headers = new Headers_1.default();
            var responseHeaders = request.getAllResponseHeaders();
            if (responseHeaders) {
                for (var _i = 0, _a = responseHeaders.split(/\r\n/g); _i < _a.length; _i++) {
                    var line = _a[_i];
                    var match = line.match(/^(.*?): (.*)$/);
                    if (match) {
                        headers.append(match[1], match[2]);
                    }
                }
            }
            _this.status = request.status;
            _this.ok = _this.status >= 200 && _this.status < 300;
            _this.statusText = request.statusText || 'OK';
            return _this;
        }
        Object.defineProperty(XhrResponse.prototype, "bodyUsed", {
            get: function () {
                return dataMap.get(this).used;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(XhrResponse.prototype, "nativeResponse", {
            get: function () {
                return dataMap.get(this).nativeResponse;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(XhrResponse.prototype, "requestOptions", {
            get: function () {
                return dataMap.get(this).requestOptions;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(XhrResponse.prototype, "url", {
            get: function () {
                return dataMap.get(this).url;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(XhrResponse.prototype, "download", {
            get: function () {
                return dataMap.get(this).downloadObservable;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(XhrResponse.prototype, "data", {
            get: function () {
                return dataMap.get(this).dataObservable;
            },
            enumerable: true,
            configurable: true
        });
        XhrResponse.prototype.arrayBuffer = function () {
            return Task_1.default.reject(new Error('ArrayBuffer not supported'));
        };
        XhrResponse.prototype.blob = function () {
            return Task_1.default.reject(new Error('Blob not supported'));
        };
        XhrResponse.prototype.formData = function () {
            return Task_1.default.reject(new Error('FormData not supported'));
        };
        XhrResponse.prototype.text = function () {
            return getDataTask(this).then(function (request) {
                return String(request.responseText);
            });
        };
        XhrResponse.prototype.xml = function () {
            var _this = this;
            return this.text().then(function (text) {
                var parser = new DOMParser();
                return parser.parseFromString(text, _this.headers.get('content-type') || 'text/html');
            });
        };
        return XhrResponse;
    }(Response_1.default));
    exports.XhrResponse = XhrResponse;
    if (has_1.default('blob')) {
        XhrResponse.prototype.blob = function () {
            return getDataTask(this).then(function (request) { return request.response; });
        };
        XhrResponse.prototype.text = function () {
            return this.blob().then(Response_1.getTextFromBlob);
        };
        if (has_1.default('arraybuffer')) {
            XhrResponse.prototype.arrayBuffer = function () {
                return this.blob().then(Response_1.getArrayBufferFromBlob);
            };
        }
    }
    if (has_1.default('formdata')) {
        XhrResponse.prototype.formData = function () {
            return this.text().then(function (text) {
                var data = new FormData();
                text.trim().split('&').forEach(function (keyValues) {
                    if (keyValues) {
                        var pairs = keyValues.split('=');
                        var name_1 = (pairs.shift() || '').replace(/\+/, ' ');
                        var value = pairs.join('=').replace(/\+/, ' ');
                        data.append(decodeURIComponent(name_1), decodeURIComponent(value));
                    }
                });
                return data;
            });
        };
    }
    function noop() { }
    function setOnError(request, reject) {
        request.addEventListener('error', function (event) {
            reject(new TypeError(event.error || 'Network request failed'));
        });
    }
    function xhr(url, options) {
        if (options === void 0) { options = {}; }
        var request = new XMLHttpRequest();
        var requestUrl = util_2.generateRequestUrl(url, options);
        options = Object.create(options);
        if (!options.method) {
            options.method = 'GET';
        }
        var isAborted = false;
        function abort() {
            isAborted = true;
            if (request) {
                request.abort();
                request.onreadystatechange = noop;
            }
        }
        var timeoutHandle;
        var timeoutReject;
        var task = new Task_1.default(function (resolve, reject) {
            timeoutReject = reject;
            request.onreadystatechange = function () {
                if (isAborted) {
                    return;
                }
                if (request.readyState === 2) {
                    var response = new XhrResponse(request);
                    var downloadSubscriptionPool_1 = new SubscriptionPool_1.default();
                    var dataSubscriptionPool_1 = new SubscriptionPool_1.default();
                    var task_1 = new Task_1.default(function (resolve, reject) {
                        timeoutReject = reject;
                        request.onprogress = function (event) {
                            if (isAborted) {
                                return;
                            }
                            downloadSubscriptionPool_1.next(event.loaded);
                        };
                        request.onreadystatechange = function () {
                            if (isAborted) {
                                return;
                            }
                            if (request.readyState === 4) {
                                request.onreadystatechange = noop;
                                timeoutHandle && timeoutHandle.destroy();
                                dataSubscriptionPool_1.next(request.response);
                                dataSubscriptionPool_1.complete();
                                resolve(request);
                            }
                        };
                        setOnError(request, reject);
                    }, abort);
                    dataMap.set(response, {
                        task: task_1,
                        used: false,
                        nativeResponse: request,
                        requestOptions: options,
                        url: requestUrl,
                        downloadObservable: new Observable_1.default(function (observer) { return downloadSubscriptionPool_1.add(observer); }),
                        dataObservable: new Observable_1.default(function (observer) { return dataSubscriptionPool_1.add(observer); })
                    });
                    resolve(response);
                }
            };
            setOnError(request, reject);
        }, abort);
        request.open(options.method, requestUrl, !options.blockMainThread, options.user, options.password);
        if (has_1.default('filereader') && has_1.default('blob')) {
            request.responseType = 'blob';
        }
        if (options.timeout && options.timeout > 0 && options.timeout !== Infinity) {
            timeoutHandle = util_1.createTimer(function () {
                // Reject first, since aborting will also fire onreadystatechange which would reject with a
                // less specific error.  (This is also why we set up our own timeout rather than using
                // native timeout and ontimeout, because that aborts and fires onreadystatechange before ontimeout.)
                timeoutReject && timeoutReject(new TimeoutError_1.default('The XMLHttpRequest request timed out'));
                abort();
            }, options.timeout);
        }
        var hasContentTypeHeader = false;
        var hasRequestedWithHeader = false;
        if (options.headers) {
            var requestHeaders = new Headers_1.default(options.headers);
            hasRequestedWithHeader = requestHeaders.has('x-requested-with');
            hasContentTypeHeader = requestHeaders.has('content-type');
            iterator_1.forOf(requestHeaders, function (_a) {
                var key = _a[0], value = _a[1];
                request.setRequestHeader(key, value);
            });
        }
        if (!hasContentTypeHeader && has_1.default('formdata') && options.body instanceof global_1.default.FormData) {
            // Assume that most forms do not contain large binary files. If that is not the case,
            // then "multipart/form-data" should be manually specified as the "Content-Type" header.
            request.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
        }
        task.finally(function () {
            if (task.state !== 0 /* Fulfilled */) {
                request.onreadystatechange = noop;
                timeoutHandle && timeoutHandle.destroy();
            }
        });
        var uploadObserverPool = new SubscriptionPool_1.default();
        task.upload = new Observable_1.default(function (observer) { return uploadObserverPool.add(observer); });
        request.upload.addEventListener('progress', function (event) {
            uploadObserverPool.next(event.loaded);
        });
        request.send(options.body || null);
        return task;
    }
    exports.default = xhr;
});
//# sourceMappingURL=xhr.js.map