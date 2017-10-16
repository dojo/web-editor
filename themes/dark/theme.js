(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "./editor.m.css", "./runner.m.css", "./scrollbar.m.css", "./treepane.m.css", "./workbench.m.css"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var editor = require("./editor.m.css");
    var runner = require("./runner.m.css");
    var scrollbar = require("./scrollbar.m.css");
    var treepane = require("./treepane.m.css");
    var workbench = require("./workbench.m.css");
    exports.default = {
        'dojo-editor': editor,
        'dojo-runner': runner,
        'dojo-scrollbar': scrollbar,
        'dojo-treepane': treepane,
        'dojo-workbench': workbench,
        editor: editor,
        runner: runner,
        scrollbar: scrollbar,
        treepane: treepane,
        workbench: workbench
    };
});
//# sourceMappingURL=theme.js.map