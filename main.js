(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "./Editor", "./project", "./Runner"], factory);
    }
})(function (require, exports) {
    "use strict";
    var Editor_1 = require("./Editor");
    var project_1 = require("./project");
    var Runner_1 = require("./Runner");
    return {
        Editor: Editor_1.default,
        project: project_1.default,
        Runner: Runner_1.default
    };
});
//# sourceMappingURL=main.js.map