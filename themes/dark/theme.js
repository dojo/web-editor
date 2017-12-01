(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "./actionbar.m.css", "./actionbarbutton.m.css", "./editor.m.css", "./livecodeexample.m.css", "./runner.m.css", "./scrollbar.m.css", "./tab.m.css", "./tablist.m.css", "./tablistscrollbar.m.css", "./toolbar.m.css", "./treepane.m.css", "./workbench.m.css"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var actionbar = require("./actionbar.m.css");
    var actionbarbutton = require("./actionbarbutton.m.css");
    var editor = require("./editor.m.css");
    var livecodeexample = require("./livecodeexample.m.css");
    var runner = require("./runner.m.css");
    var scrollbar = require("./scrollbar.m.css");
    var tab = require("./tab.m.css");
    var tablist = require("./tablist.m.css");
    var tablistscrollbar = require("./tablistscrollbar.m.css");
    var toolbar = require("./toolbar.m.css");
    var treepane = require("./treepane.m.css");
    var workbench = require("./workbench.m.css");
    exports.default = {
        'dojo-actionbar': actionbar,
        'dojo-actionbarbutton': actionbarbutton,
        'dojo-editor': editor,
        'dojo-livecodeexample': livecodeexample,
        'dojo-runner': runner,
        'dojo-scrollbar': scrollbar,
        'dojo-tab': tab,
        'dojo-tablist': tablist,
        'dojo-tablistscrollbar': tablistscrollbar,
        'dojo-toolbar': toolbar,
        'dojo-treepane': treepane,
        'dojo-workbench': workbench,
        actionbar: actionbar,
        actionbarbutton: actionbarbutton,
        editor: editor,
        livecodeexample: livecodeexample,
        runner: runner,
        scrollbar: scrollbar,
        tab: tab,
        tablist: tablist,
        tablistscrollbar: tablistscrollbar,
        toolbar: toolbar,
        treepane: treepane,
        workbench: workbench
    };
});
//# sourceMappingURL=theme.js.map