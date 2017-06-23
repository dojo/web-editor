(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "./editor.m.css", "./runner.m.css", "./scrollbar.m.css", "./tabPane.m.css", "./treepane.m.css"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var editor = require("./editor.m.css");
    var runner = require("./runner.m.css");
    var scrollbar = require("./scrollbar.m.css");
    var tabPane = require("./tabPane.m.css");
    var treePane = require("./treepane.m.css");
    exports.default = {
        'dojo-editor': editor,
        'dojo-runner': runner,
        'dojo-scrollbar': scrollbar,
        'dojo-tabPane': tabPane,
        'dojo-treepane': treePane
    };
});
//# sourceMappingURL=theme.js.map