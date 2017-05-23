(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "source-map"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var source_map_1 = require("source-map");
    var SOURCE_MAP_REGEX = /(?:\/{2}[#@]{1,2}|\/\*)\s+sourceMappingURL\s*=\s*(data:(?:[^;]+;)+base64,)?(\S+)(?:\n\s*)?$/;
    /**
     * Wrap code, which has a source map, with a preamble and a postscript and return the wrapped code with an updated
     * map.
     * @param preamble A string to append before the code
     * @param code The code, with an optional source map in string format
     * @param postscript A string to append after the code
     */
    function wrapCode(preamble, code, postscript) {
        var result = new source_map_1.SourceNode();
        result.add(preamble);
        if (code.map) {
            result.add(source_map_1.SourceNode.fromStringWithSourceMap(code.code.replace(SOURCE_MAP_REGEX, ''), new source_map_1.SourceMapConsumer(code.map)));
        }
        else {
            result.add(code.code);
        }
        result.add(postscript);
        return result.toStringWithSourceMap();
    }
    exports.wrapCode = wrapCode;
});
//# sourceMappingURL=sourceMap.js.map