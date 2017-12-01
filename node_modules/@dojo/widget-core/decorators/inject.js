(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "@dojo/shim/WeakMap", "./handleDecorator", "./beforeProperties"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var WeakMap_1 = require("@dojo/shim/WeakMap");
    var handleDecorator_1 = require("./handleDecorator");
    var beforeProperties_1 = require("./beforeProperties");
    /**
     * Map of instances against registered injectors.
     */
    var registeredInjectorsMap = new WeakMap_1.default();
    /**
     * Decorator retrieves an injector from an available registry using the name and
     * calls the `getProperties` function with the payload from the injector
     * and current properties with the the injected properties returned.
     *
     * @param InjectConfig the inject configuration
     */
    function inject(_a) {
        var name = _a.name, getProperties = _a.getProperties;
        return handleDecorator_1.handleDecorator(function (target, propertyKey) {
            beforeProperties_1.beforeProperties(function (properties) {
                var _this = this;
                var injector = this.registry.getInjector(name);
                if (injector) {
                    var registeredInjectors = registeredInjectorsMap.get(this) || [];
                    if (registeredInjectors.length === 0) {
                        registeredInjectorsMap.set(this, registeredInjectors);
                    }
                    if (registeredInjectors.indexOf(injector) === -1) {
                        injector.on('invalidate', function () {
                            _this.invalidate();
                        });
                        registeredInjectors.push(injector);
                    }
                    return getProperties(injector.get(), properties);
                }
            })(target);
        });
    }
    exports.inject = inject;
    exports.default = inject;
});
//# sourceMappingURL=inject.js.map