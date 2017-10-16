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
    /**
     * Retrieve the absolute posistion for a mouse/touch event
     * @param evt The event to determine the position for
     * @param horizontal A flag to calculate the horizontal position
     * @return the absolute number of the position for the event
     */
    function getAbsolutePosition(evt, horizontal) {
        return evt.type.match(/^touch/) ?
            horizontal ? evt.changedTouches[0].screenX : evt.changedTouches[0].screenY :
            horizontal ? evt.pageX : evt.pageY;
    }
    exports.getAbsolutePosition = getAbsolutePosition;
});
//# sourceMappingURL=events.js.map