(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "@dojo/routing/Route", "@dojo/routing/Router", "@dojo/routing/history/HashHistory"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var Route_1 = require("@dojo/routing/Route");
    var Router_1 = require("@dojo/routing/Router");
    var HashHistory_1 = require("@dojo/routing/history/HashHistory");
    var router = new Router_1.default({ history: new HashHistory_1.default() });
    exports.setPath = router.setPath.bind(router);
    /**
     * Configure and start a router which handles routes as references to gists
     * @param options Listeners for specific routes
     */
    function startGistRouter(options) {
        router.append(new Route_1.default({
            path: '/',
            exec: options.onRoot
        }));
        router.append(new Route_1.default({
            path: '/{id}',
            exec: options.onGist
        }));
        return router.start();
    }
    exports.startGistRouter = startGistRouter;
});
//# sourceMappingURL=routing.js.map