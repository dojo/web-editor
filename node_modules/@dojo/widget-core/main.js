(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "tslib", "./animations/cssTransitions", "./customElements", "./d", "./Registry", "./mixins/I18n", "./mixins/Projector", "./mixins/Themed", "./registerCustomElement", "./util/DomWrapper", "./WidgetBase"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var tslib_1 = require("tslib");
    tslib_1.__exportStar(require("./animations/cssTransitions"), exports);
    tslib_1.__exportStar(require("./customElements"), exports);
    tslib_1.__exportStar(require("./d"), exports);
    tslib_1.__exportStar(require("./Registry"), exports);
    tslib_1.__exportStar(require("./mixins/I18n"), exports);
    tslib_1.__exportStar(require("./mixins/Projector"), exports);
    tslib_1.__exportStar(require("./mixins/Themed"), exports);
    tslib_1.__exportStar(require("./registerCustomElement"), exports);
    tslib_1.__exportStar(require("./util/DomWrapper"), exports);
    tslib_1.__exportStar(require("./WidgetBase"), exports);
});
//# sourceMappingURL=main.js.map