(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    function getEmit() {
        var files = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            files[_i] = arguments[_i];
        }
        return files.map(function (_a) {
            var name = _a.name, text = _a.text;
            return { name: name, text: "define([], function () { return '" + JSON.stringify(JSON.parse(text)) + "'; });", type: 4 /* JavaScript */ };
        });
    }
    exports.getEmit = getEmit;
});
//# sourceMappingURL=json.js.map