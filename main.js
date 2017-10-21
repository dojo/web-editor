(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "./project", "./routing", "./Workbench"], factory);
    }
})(function (require, exports) {
    "use strict";
    var project_1 = require("./project");
    var routing = require("./routing");
    var Workbench_1 = require("./Workbench");
    return {
        project: project_1.default,
        routing: routing,
        Workbench: Workbench_1.default
    };
});
//# sourceMappingURL=main.js.map