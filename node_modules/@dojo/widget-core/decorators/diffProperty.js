(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "./handleDecorator"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var handleDecorator_1 = require("./handleDecorator");
    /**
     * Decorator that can be used to register a function as a specific property diff
     *
     * @param propertyName  The name of the property of which the diff function is applied
     * @param diffType      The diff type, default is DiffType.AUTO.
     * @param diffFunction  A diff function to run if diffType if DiffType.CUSTOM
     */
    function diffProperty(propertyName, diffFunction, reactionFunction) {
        return handleDecorator_1.handleDecorator(function (target, propertyKey) {
            target.addDecorator("diffProperty:" + propertyName, diffFunction.bind(null));
            target.addDecorator('registeredDiffProperty', propertyName);
            if (reactionFunction || propertyKey) {
                target.addDecorator('diffReaction', {
                    propertyName: propertyName,
                    reaction: propertyKey ? target[propertyKey] : reactionFunction
                });
            }
        });
    }
    exports.diffProperty = diffProperty;
    exports.default = diffProperty;
});
//# sourceMappingURL=diffProperty.js.map