(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "@dojo/routing/Router", "@dojo/routing/history/HashHistory"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var Router_1 = require("@dojo/routing/Router");
    var HashHistory_1 = require("@dojo/routing/history/HashHistory");
    var router = new Router_1.default({ history: new HashHistory_1.default() });
    exports.default = router;
});
//# sourceMappingURL=router.js.map