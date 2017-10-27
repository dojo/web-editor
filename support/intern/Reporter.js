var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "util", "istanbul-reports", "istanbul-lib-coverage", "istanbul-lib-report", "intern/lib/reporters/Runner", "intern/lib/reporters/Reporter"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var nodeUtil = require("util");
    var istanbul_reports_1 = require("istanbul-reports");
    var istanbul_lib_coverage_1 = require("istanbul-lib-coverage");
    var istanbul_lib_report_1 = require("istanbul-lib-report");
    var Runner_1 = require("intern/lib/reporters/Runner");
    var Reporter_1 = require("intern/lib/reporters/Reporter");
    var LIGHT_RED = '\x1b[91m';
    var LIGHT_GREEN = '\x1b[92m';
    var LIGHT_MAGENTA = '\x1b[95m';
    var eventHandler = Reporter_1.createEventHandler();
    var Reporter = (function (_super) {
        __extends(Reporter, _super);
        function Reporter(executor, options) {
            if (options === void 0) { options = {}; }
            var _this = _super.call(this, executor, options) || this;
            _this._errors = {};
            _this.directory = options.directory || '.';
            _this.lcovFilename = options.lcovFilename || 'coverage-final.lcov';
            _this.htmlDirectory = options.htmlDirectory || 'html-report';
            return _this;
        }
        Reporter.prototype.createCoverageReport = function (type, data, options) {
            if (options === void 0) { options = {}; }
            var map;
            if (isCoverageMap(data)) {
                map = data;
            }
            else {
                map = istanbul_lib_coverage_1.createCoverageMap(data);
            }
            var transformed = this.executor.sourceMapStore.transformCoverage(map);
            var context = istanbul_lib_report_1.createContext({
                dir: options.directory || this.directory,
                sourceFinder: transformed.sourceFinder,
                watermarks: this.watermarks
            });
            var tree = istanbul_lib_report_1.summarizers.pkg(transformed.map);
            var report = istanbul_reports_1.create(type, { file: options.filename });
            tree.visit(report, context);
        };
        Reporter.prototype.error = function () {
            this.hasRunErrors = true;
        };
        Reporter.prototype.runEnd = function () {
            var _this = this;
            var numTests = 0;
            var numPassedTests = 0;
            var numFailedTests = 0;
            var numSkippedTests = 0;
            var sessionIds = Object.keys(this.sessions);
            var numEnvironments = sessionIds.length;
            sessionIds.forEach(function (sessionId) {
                var session = _this.sessions[sessionId];
                numTests += session.suite.numTests;
                numPassedTests += session.suite.numPassedTests;
                numFailedTests += session.suite.numFailedTests;
                numSkippedTests += session.suite.numSkippedTests;
            });
            var charm = this.charm;
            charm.write('\n');
            var map = this.executor.coverageMap;
            if (map.files().length > 0) {
                charm.write('\n');
                charm.display('bright');
                charm.write('Total coverage\n');
                charm.display('reset');
                this.createCoverageReport('text', map, {});
                this.createCoverageReport('lcovonly', map, {
                    filename: this.lcovFilename
                });
                this.createCoverageReport('html', map, {
                    directory: this.htmlDirectory
                });
            }
            var message = "TOTAL: tested " + numEnvironments + " platforms, " + numFailedTests + "/" + numTests + " failed";
            if (numSkippedTests) {
                message += " (" + numSkippedTests + " skipped)";
            }
            if (this.hasRunErrors) {
                message += '; fatal error occurred';
            }
            else if (this.hasSuiteErrors) {
                message += '; suite error occurred';
            }
            charm.foreground(numFailedTests > 0 || this.hasRunErrors || this.hasSuiteErrors ? 'red' : 'green');
            charm.write(message);
            charm.display('reset');
            charm.write('\n');
        };
        Reporter.prototype.suiteStart = function (suite) {
            if (!suite.hasParent) {
                this.sessions[suite.sessionId || ''] = { suite: suite };
                if (suite.sessionId) {
                    this.charm.write('\n');
                    this.charm.write("\n\u2023 Created session " + suite.name + " (" + suite.sessionId + "\n");
                }
            }
        };
        Reporter.prototype.suiteEnd = function (suite) {
            var session = this.sessions[suite.sessionId || ''];
            if (!session) {
                if (!this.serveOnly) {
                    var charm = this.charm;
                    charm.display('bright');
                    charm.foreground('yellow');
                    charm.write("BUG: suiteEnd was received for invalid session " + suite.sessionId);
                    charm.display('reset');
                    charm.write('\n');
                }
                return;
            }
            if (suite.error) {
                this.hasSuiteErrors = session.hasSuiteErrors = true;
            }
            else if (!suite.hasParent && this.executor.suites.length > 1) {
                // Runner mode test with no sessionId was some failed test, not a bug
                if (!suite.sessionId) {
                    return;
                }
                var session_1 = this.sessions[suite.sessionId];
                var charm_1 = this.charm;
                if (!session_1.coverage) {
                    charm_1.write('No unit test coverage for ' + suite.name);
                    charm_1.display('reset');
                    charm_1.write('\n');
                }
                charm_1.write('\n\n');
                if (this._errors[suite.sessionId]) {
                    this._errors[suite.sessionId].forEach(function (test) {
                        charm_1.write(LIGHT_RED);
                        charm_1.write('× ' + test.id);
                        charm_1.foreground('white');
                        charm_1.write(' (' + (test.timeElapsed / 1000) + 's)');
                        charm_1.write('\n');
                        charm_1.foreground('red');
                        charm_1.write(test.error);
                        charm_1.display('reset');
                        charm_1.write('\n\n');
                    });
                }
                var name_1 = suite.name;
                var hasError = suite.error || session_1.hasSuiteErrors;
                var numTests = suite.numTests;
                var numFailedTests = suite.numFailedTests;
                var numSkippedTests = suite.numSkippedTests;
                var summary = nodeUtil.format('%s: %d/%d tests failed', name_1, numFailedTests, numTests);
                if (numSkippedTests) {
                    summary += ' (' + numSkippedTests + ' skipped)';
                }
                if (hasError) {
                    summary += '; suite error occurred';
                }
                charm_1.write(numFailedTests || hasError > 0 ? LIGHT_RED : LIGHT_GREEN);
                charm_1.write(summary);
                charm_1.display('reset');
                charm_1.write('\n\n');
            }
        };
        Reporter.prototype.testEnd = function (test) {
            var charm = this.charm;
            if (test.error) {
                if (!this._errors[test.sessionId]) {
                    this._errors[test.sessionId] = [];
                }
                this._errors[test.sessionId].push({
                    id: test.id,
                    timeElapsed: test.timeElapsed,
                    error: this.executor.formatError(test.error)
                });
                charm.write(LIGHT_RED);
                charm.write('×');
            }
            else if (test.skipped) {
                charm.write(LIGHT_MAGENTA);
                charm.write('~');
            }
            else {
                charm.write(LIGHT_GREEN);
                charm.write('✓');
            }
            charm.display('reset');
        };
        __decorate([
            eventHandler()
        ], Reporter.prototype, "error", null);
        __decorate([
            eventHandler()
        ], Reporter.prototype, "runEnd", null);
        __decorate([
            eventHandler()
        ], Reporter.prototype, "suiteStart", null);
        __decorate([
            eventHandler()
        ], Reporter.prototype, "suiteEnd", null);
        __decorate([
            eventHandler()
        ], Reporter.prototype, "testEnd", null);
        return Reporter;
    }(Runner_1.default));
    exports.default = Reporter;
    function isCoverageMap(value) {
        return value != null && typeof value.files === 'function';
    }
    intern.registerPlugin('grunt-dojo2', function () {
        intern.registerReporter('grunt-dojo2', Reporter);
        var reporters = intern._reporters || [];
        // Intern currently initializes reporters before plugins are
        // loaded, so we need a default reporter to report errors until our
        // reporter is initialized. The default reporters have their event
        // handlers set to a noop function so they don't output anything
        // afterwards.
        reporters.forEach(function (reporter) {
            Object.keys(reporter._eventHandlers).forEach(function (key) {
                var property = reporter._eventHandlers[key];
                reporter[property] = function () { };
            });
        });
        intern._reporters = [
            new Reporter(intern)
        ];
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUmVwb3J0ZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJSZXBvcnRlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7SUFDQSwrQkFBaUM7SUFHakMscURBQXNEO0lBQ3RELCtEQUkrQjtJQUMvQiwyREFBNkU7SUFHN0UsMEJBQXdCO0lBTXhCLHNEQUF1RTtJQUV2RSwwREFBbUU7SUFFbkUsSUFBTSxTQUFTLEdBQUcsVUFBVSxDQUFDO0lBQzdCLElBQU0sV0FBVyxHQUFHLFVBQVUsQ0FBQztJQUMvQixJQUFNLGFBQWEsR0FBRyxVQUFVLENBQUM7SUFFakMsSUFBTSxZQUFZLEdBQUcsNkJBQWtCLEVBQVUsQ0FBQztJQW9CbEQ7UUFBc0MsNEJBQU07UUFPM0Msa0JBQVksUUFBYyxFQUFFLE9BQXlDO1lBQXpDLHdCQUFBLEVBQUEsWUFBeUM7WUFBckUsWUFDQyxrQkFBTSxRQUFRLEVBQUUsT0FBTyxDQUFDLFNBS3hCO1lBWk8sYUFBTyxHQUE0QyxFQUFFLENBQUM7WUFTN0QsS0FBSSxDQUFDLFNBQVMsR0FBRyxPQUFPLENBQUMsU0FBUyxJQUFJLEdBQUcsQ0FBQztZQUMxQyxLQUFJLENBQUMsWUFBWSxHQUFHLE9BQU8sQ0FBQyxZQUFZLElBQUkscUJBQXFCLENBQUM7WUFDbEUsS0FBSSxDQUFDLGFBQWEsR0FBRyxPQUFPLENBQUMsYUFBYSxJQUFJLGFBQWEsQ0FBQzs7UUFDN0QsQ0FBQztRQUVELHVDQUFvQixHQUFwQixVQUFxQixJQUFnQixFQUFFLElBQW1DLEVBQUUsT0FBMkI7WUFBM0Isd0JBQUEsRUFBQSxZQUEyQjtZQUN0RyxJQUFJLEdBQWdCLENBQUM7WUFFckIsRUFBRSxDQUFDLENBQUMsYUFBYSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFDekIsR0FBRyxHQUFHLElBQUksQ0FBQztZQUNaLENBQUM7WUFBQyxJQUFJLENBQUMsQ0FBQztnQkFDUCxHQUFHLEdBQUcseUNBQWlC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RixlQUFDO0tBQUEsQUFoTkQsQ0FBc0MsZ0JBQU0sR0FnTjNDO3NCQWhOb0IsUUFBUTtJQWtON0IsdUJBQXVCLEtBQVU7UUFDaEMsTUFBTSxDQUFDLEtBQUssSUFBSSxJQUFJLElBQUksT0FBTyxLQUFLLENBQUMsS0FBSyxLQUFLLFVBQVUsQ0FBQztJQUMzRCxDQUFDO0lBRUQsTUFBTSxDQUFDLGNBQWMsQ0FBQyxhQUFhLEVBQUU7UUFDcEMsTUFBTSxDQUFDLGdCQUFnQixDQUFDLGFBQWEsRUFBRSxRQUFRLENBQUMsQ0FBQztRQUNqRCxJQUFNLFNBQVMsR0FBaUIsTUFBTyxDQUFDLFVBQVUsSUFBSSxFQUFFLENBQUM7UUFFekQsNERBQTREO1FBQzVELG1FQUFtRTtRQUNuRSxrRUFBa0U7UUFDbEUsZ0VBQWdFO1FBQ2hFLGNBQWM7UUFDZCxTQUFTLENBQUMsT0FBTyxDQUFDLFVBQUEsUUFBUTtZQUN6QixNQUFNLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxjQUFjLENBQUMsQ0FBQyxPQUFPLENBQUMsVUFBQSxHQUFHO2dCQUMvQyxJQUFNLFFBQVEsR0FBVyxRQUFRLENBQUMsY0FBYyxDQUFDLEdBQUcsQ0FBQyxDQUFDO2dCQUN0RCxRQUFRLENBQUMsUUFBUSxDQUFDLEdBQUcsY0FBTyxDQUFDLENBQUM7WUFDL0IsQ0FBQyxDQUFDLENBQUM7UUFDSixDQUFDLENBQUMsQ0FBQztRQUVJLE1BQU8sQ0FBQyxVQUFVLEdBQUc7WUFDM0IsSUFBSSxRQUFRLENBQUMsTUFBTSxDQUFDO1NBQ3BCLENBQUM7SUFDSCxDQUFDLENBQUMsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCAqIGFzIGZzIGZyb20gJ2ZzJztcbmltcG9ydCAqIGFzIG5vZGVVdGlsIGZyb20gJ3V0aWwnO1xuaW1wb3J0ICogYXMgcGF0aCBmcm9tICdwYXRoJztcbmltcG9ydCB7IGRlZXBBc3NpZ24gfSBmcm9tICdAZG9qby9jb3JlL2xhbmcnO1xuaW1wb3J0IHsgY3JlYXRlLCBSZXBvcnRUeXBlIH0gZnJvbSAnaXN0YW5idWwtcmVwb3J0cyc7XG5pbXBvcnQge1xuXHRDb3ZlcmFnZU1hcCxcblx0Q292ZXJhZ2VNYXBEYXRhLFxuXHRjcmVhdGVDb3ZlcmFnZU1hcFxufSBmcm9tICdpc3RhbmJ1bC1saWItY292ZXJhZ2UnO1xuaW1wb3J0IHsgY3JlYXRlQ29udGV4dCwgc3VtbWFyaXplcnMsIFdhdGVybWFya3MgfSBmcm9tICdpc3RhbmJ1bC1saWItcmVwb3J0JztcblxuaW1wb3J0IGdsb2IgPSByZXF1aXJlKCdnbG9iJyk7XG5pbXBvcnQgJ2lzdGFuYnVsL2luZGV4JztcblxuaW1wb3J0IE5vZGUsIHsgRXZlbnRzIH0gZnJvbSAnaW50ZXJuL2xpYi9leGVjdXRvcnMvTm9kZSc7XG5pbXBvcnQgVGVzdCBmcm9tICdpbnRlcm4vbGliL1Rlc3QnO1xuaW1wb3J0IFN1aXRlIGZyb20gJ2ludGVybi9saWIvU3VpdGUnO1xuaW1wb3J0IHsgQ292ZXJhZ2VQcm9wZXJ0aWVzIH0gZnJvbSAnaW50ZXJuL2xpYi9yZXBvcnRlcnMvQ292ZXJhZ2UnO1xuaW1wb3J0IFJ1bm5lciwgeyBSdW5uZXJQcm9wZXJ0aWVzIH0gZnJvbSAnaW50ZXJuL2xpYi9yZXBvcnRlcnMvUnVubmVyJztcbmltcG9ydCBCYXNlUmVwb3J0ZXIgZnJvbSAnaW50ZXJuL2xpYi9yZXBvcnRlcnMvUmVwb3J0ZXInO1xuaW1wb3J0IHsgY3JlYXRlRXZlbnRIYW5kbGVyIH0gZnJvbSAnaW50ZXJuL2xpYi9yZXBvcnRlcnMvUmVwb3J0ZXInO1xuXG5jb25zdCBMSUdIVF9SRUQgPSAnXFx4MWJbOTFtJztcbmNvbnN0IExJR0hUX0dSRUVOID0gJ1xceDFiWzkybSc7XG5jb25zdCBMSUdIVF9NQUdFTlRBID0gJ1xceDFiWzk1bSc7XG5cbmNvbnN0IGV2ZW50SGFuZGxlciA9IGNyZWF0ZUV2ZW50SGFuZGxlcjxFdmVudHM+KCk7XG5cbmludGVyZmFjZSBFcnJvck9iamVjdCB7XG5cdGlkOiBzdHJpbmc7XG5cdHRpbWVFbGFwc2VkOiBudW1iZXI7XG5cdGVycm9yOiBzdHJpbmc7XG59XG5cbmludGVyZmFjZSBSZXBvcnRPcHRpb25zIHtcblx0ZmlsZW5hbWU/OiBzdHJpbmc7XG5cdGRpcmVjdG9yeT86IHN0cmluZztcbn1cblxuaW50ZXJmYWNlIFJlcG9ydGVyUHJvcGVydGllcyBleHRlbmRzIENvdmVyYWdlUHJvcGVydGllcyB7XG5cdGRpcmVjdG9yeT86IHN0cmluZztcblx0bGNvdkZpbGVuYW1lPzogc3RyaW5nO1xuXHRodG1sRGlyZWN0b3J5Pzogc3RyaW5nO1xuXHR3YXRlcm1hcmtzPzogV2F0ZXJtYXJrcztcbn1cblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgUmVwb3J0ZXIgZXh0ZW5kcyBSdW5uZXIge1xuXHRwcml2YXRlIF9lcnJvcnM6IHsgW3Nlc3Npb25JZDogc3RyaW5nIF06IEVycm9yT2JqZWN0W10gfSA9IHt9O1xuXG5cdGRpcmVjdG9yeTogc3RyaW5nO1xuXHRsY292RmlsZW5hbWU6IHN0cmluZztcblx0aHRtbERpcmVjdG9yeTogc3RyaW5nO1xuXG5cdGNvbnN0cnVjdG9yKGV4ZWN1dG9yOiBOb2RlLCBvcHRpb25zOiBQYXJ0aWFsPFJlcG9ydGVyUHJvcGVydGllcz4gPSB7fSkge1xuXHRcdHN1cGVyKGV4ZWN1dG9yLCBvcHRpb25zKTtcblxuXHRcdHRoaXMuZGlyZWN0b3J5ID0gb3B0aW9ucy5kaXJlY3RvcnkgfHwgJy4nO1xuXHRcdHRoaXMubGNvdkZpbGVuYW1lID0gb3B0aW9ucy5sY292RmlsZW5hbWUgfHwgJ2NvdmVyYWdlLWZpbmFsLmxjb3YnO1xuXHRcdHRoaXMuaHRtbERpcmVjdG9yeSA9IG9wdGlvbnMuaHRtbERpcmVjdG9yeSB8fCAnaHRtbC1yZXBvcnQnO1xuXHR9XG5cblx0Y3JlYXRlQ292ZXJhZ2VSZXBvcnQodHlwZTogUmVwb3J0VHlwZSwgZGF0YTogQ292ZXJhZ2VNYXBEYXRhIHwgQ292ZXJhZ2VNYXAsIG9wdGlvbnM6IFJlcG9ydE9wdGlvbnMgPSB7fSkge1xuXHRcdGxldCBtYXA6IENvdmVyYWdlTWFwO1xuXG5cdFx0aWYgKGlzQ292ZXJhZ2VNYXAoZGF0YSkpIHtcblx0XHRcdG1hcCA9IGRhdGE7XG5cdFx0fSBlbHNlIHtcblx0XHRcdG1hcCA9IGNyZWF0ZUNvdmVyYWdlTWFwKGRhdGEpO1xuXHRcdH1cblxuXHRcdGNvbnN0IHRyYW5zZm9ybWVkID0gdGhpcy5leGVjdXRvci5zb3VyY2VNYXBTdG9yZS50cmFuc2Zvcm1Db3ZlcmFnZShtYXApO1xuXG5cdFx0Y29uc3QgY29udGV4dCA9IGNyZWF0ZUNvbnRleHQoe1xuXHRcdFx0ZGlyOiBvcHRpb25zLmRpcmVjdG9yeSB8fCB0aGlzLmRpcmVjdG9yeSxcblx0XHRcdHNvdXJjZUZpbmRlcjogdHJhbnNmb3JtZWQuc291cmNlRmluZGVyLFxuXHRcdFx0d2F0ZXJtYXJrczogdGhpcy53YXRlcm1hcmtzXG5cdFx0fSk7XG5cdFx0Y29uc3QgdHJlZSA9IHN1bW1hcml6ZXJzLnBrZyh0cmFuc2Zvcm1lZC5tYXApO1xuXHRcdGNvbnN0IHJlcG9ydCA9IGNyZWF0ZSh0eXBlLCB7IGZpbGU6IG9wdGlvbnMuZmlsZW5hbWUgfSk7XG5cdFx0dHJlZS52aXNpdChyZXBvcnQsIGNvbnRleHQpO1xuXHR9XG5cblx0QGV2ZW50SGFuZGxlcigpXG5cdGVycm9yKCkge1xuXHRcdHRoaXMuaGFzUnVuRXJyb3JzID0gdHJ1ZTtcblx0fVxuXG5cdEBldmVudEhhbmRsZXIoKVxuXHRydW5FbmQoKSB7XG5cdFx0bGV0IG51bVRlc3RzID0gMDtcblx0XHRsZXQgbnVtUGFzc2VkVGVzdHMgPSAwO1xuXHRcdGxldCBudW1GYWlsZWRUZXN0cyA9IDA7XG5cdFx0bGV0IG51bVNraXBwZWRUZXN0cyA9IDA7XG5cblx0XHRjb25zdCBzZXNzaW9uSWRzID0gT2JqZWN0LmtleXModGhpcy5zZXNzaW9ucyk7XG5cdFx0Y29uc3QgbnVtRW52aXJvbm1lbnRzID0gc2Vzc2lvbklkcy5sZW5ndGg7XG5cblx0XHRzZXNzaW9uSWRzLmZvckVhY2goc2Vzc2lvbklkID0+IHtcblx0XHRcdGNvbnN0IHNlc3Npb24gPSB0aGlzLnNlc3Npb25zW3Nlc3Npb25JZF07XG5cdFx0XHRudW1UZXN0cyArPSBzZXNzaW9uLnN1aXRlLm51bVRlc3RzO1xuXHRcdFx0bnVtUGFzc2VkVGVzdHMgKz0gc2Vzc2lvbi5zdWl0ZS5udW1QYXNzZWRUZXN0cztcblx0XHRcdG51bUZhaWxlZFRlc3RzICs9IHNlc3Npb24uc3VpdGUubnVtRmFpbGVkVGVzdHM7XG5cdFx0XHRudW1Ta2lwcGVkVGVzdHMgKz0gc2Vzc2lvbi5zdWl0ZS5udW1Ta2lwcGVkVGVzdHM7XG5cdFx0fSk7XG5cblx0XHRjb25zdCB7IGNoYXJtIH0gPSB0aGlzO1xuXHRcdGNoYXJtLndyaXRlKCdcXG4nKTtcblxuXHRcdGNvbnN0IG1hcCA9IHRoaXMuZXhlY3V0b3IuY292ZXJhZ2VNYXA7XG5cblx0XHRpZiAobWFwLmZpbGVzKCkubGVuZ3RoID4gMCkge1xuXHRcdFx0Y2hhcm0ud3JpdGUoJ1xcbicpO1xuXHRcdFx0Y2hhcm0uZGlzcGxheSgnYnJpZ2h0Jyk7XG5cdFx0XHRjaGFybS53cml0ZSgnVG90YWwgY292ZXJhZ2VcXG4nKTtcblx0XHRcdGNoYXJtLmRpc3BsYXkoJ3Jlc2V0Jyk7XG5cblx0XHRcdHRoaXMuY3JlYXRlQ292ZXJhZ2VSZXBvcnQoJ3RleHQnLCBtYXAsIHt9KTtcblx0XHRcdHRoaXMuY3JlYXRlQ292ZXJhZ2VSZXBvcnQoJ2xjb3Zvbmx5JywgbWFwLCB7XG5cdFx0XHRcdGZpbGVuYW1lOiB0aGlzLmxjb3ZGaWxlbmFtZVxuXHRcdFx0fSk7XG5cdFx0XHR0aGlzLmNyZWF0ZUNvdmVyYWdlUmVwb3J0KCdodG1sJywgbWFwLCB7XG5cdFx0XHRcdGRpcmVjdG9yeTogdGhpcy5odG1sRGlyZWN0b3J5XG5cdFx0XHR9KTtcblx0XHR9XG5cblx0XHRsZXQgbWVzc2FnZSA9IGBUT1RBTDogdGVzdGVkICR7bnVtRW52aXJvbm1lbnRzfSBwbGF0Zm9ybXMsICR7bnVtRmFpbGVkVGVzdHN9LyR7bnVtVGVzdHN9IGZhaWxlZGA7XG5cblx0XHRpZiAobnVtU2tpcHBlZFRlc3RzKSB7XG5cdFx0XHRtZXNzYWdlICs9IGAgKCR7bnVtU2tpcHBlZFRlc3RzfSBza2lwcGVkKWA7XG5cdFx0fVxuXG5cdFx0aWYgKHRoaXMuaGFzUnVuRXJyb3JzKSB7XG5cdFx0XHRtZXNzYWdlICs9ICc7IGZhdGFsIGVycm9yIG9jY3VycmVkJztcblx0XHR9XG5cdFx0ZWxzZSBpZiAodGhpcy5oYXNTdWl0ZUVycm9ycykge1xuXHRcdFx0bWVzc2FnZSArPSAnOyBzdWl0ZSBlcnJvciBvY2N1cnJlZCc7XG5cdFx0fVxuXG5cdFx0Y2hhcm0uZm9yZWdyb3VuZChudW1GYWlsZWRUZXN0cyA+IDAgfHwgdGhpcy5oYXNSdW5FcnJvcnMgfHwgdGhpcy5oYXNTdWl0ZUVycm9ycyA/ICdyZWQnIDogJ2dyZWVuJyk7XG5cdFx0Y2hhcm0ud3JpdGUobWVzc2FnZSk7XG5cdFx0Y2hhcm0uZGlzcGxheSgncmVzZXQnKTtcblx0XHRjaGFybS53cml0ZSgnXFxuJyk7XG5cdH1cblxuXHRAZXZlbnRIYW5kbGVyKClcblx0c3VpdGVTdGFydChzdWl0ZTogU3VpdGUpOiB2b2lkIHtcblx0XHRpZiAoIXN1aXRlLmhhc1BhcmVudCkge1xuXHRcdFx0dGhpcy5zZXNzaW9uc1tzdWl0ZS5zZXNzaW9uSWQgfHwgJyddID0geyBzdWl0ZTogc3VpdGUgfTtcblx0XHRcdGlmIChzdWl0ZS5zZXNzaW9uSWQpIHtcblx0XHRcdFx0dGhpcy5jaGFybS53cml0ZSgnXFxuJyk7XG5cdFx0XHRcdHRoaXMuY2hhcm0ud3JpdGUoYFxcbuKAoyBDcmVhdGVkIHNlc3Npb24gJHtzdWl0ZS5uYW1lfSAoJHtzdWl0ZS5zZXNzaW9uSWR9XFxuYCk7XG5cdFx0XHR9XG5cdFx0fVxuXHR9XG5cblx0QGV2ZW50SGFuZGxlcigpXG5cdHN1aXRlRW5kKHN1aXRlOiBTdWl0ZSk6IHZvaWQge1xuXHRcdGNvbnN0IHNlc3Npb24gPSB0aGlzLnNlc3Npb25zW3N1aXRlLnNlc3Npb25JZCB8fCAnJ107XG5cdFx0aWYgKCFzZXNzaW9uKSB7XG5cdFx0XHRpZiAoIXRoaXMuc2VydmVPbmx5KSB7XG5cdFx0XHRcdGNvbnN0IGNoYXJtID0gdGhpcy5jaGFybTtcblx0XHRcdFx0Y2hhcm0uZGlzcGxheSgnYnJpZ2h0Jyk7XG5cdFx0XHRcdGNoYXJtLmZvcmVncm91bmQoJ3llbGxvdycpO1xuXHRcdFx0XHRjaGFybS53cml0ZShgQlVHOiBzdWl0ZUVuZCB3YXMgcmVjZWl2ZWQgZm9yIGludmFsaWQgc2Vzc2lvbiAke3N1aXRlLnNlc3Npb25JZH1gKTtcblx0XHRcdFx0Y2hhcm0uZGlzcGxheSgncmVzZXQnKTtcblx0XHRcdFx0Y2hhcm0ud3JpdGUoJ1xcbicpO1xuXHRcdFx0fVxuXG5cdFx0XHRyZXR1cm47XG5cdFx0fVxuXG5cdFx0aWYgKHN1aXRlLmVycm9yKSB7XG5cdFx0XHR0aGlzLmhhc1N1aXRlRXJyb3JzID0gc2Vzc2lvbi5oYXNTdWl0ZUVycm9ycyA9IHRydWU7XG5cdFx0fVxuXHRcdGVsc2UgaWYgKCFzdWl0ZS5oYXNQYXJlbnQgJiYgdGhpcy5leGVjdXRvci5zdWl0ZXMubGVuZ3RoID4gMSkge1xuXHRcdFx0Ly8gUnVubmVyIG1vZGUgdGVzdCB3aXRoIG5vIHNlc3Npb25JZCB3YXMgc29tZSBmYWlsZWQgdGVzdCwgbm90IGEgYnVnXG5cdFx0XHRpZiAoIXN1aXRlLnNlc3Npb25JZCkge1xuXHRcdFx0XHRyZXR1cm47XG5cdFx0XHR9XG5cblx0XHRcdGNvbnN0IHNlc3Npb24gPSB0aGlzLnNlc3Npb25zW3N1aXRlLnNlc3Npb25JZF07XG5cdFx0XHRjb25zdCB7IGNoYXJtIH0gPSB0aGlzO1xuXG5cdFx0XHRpZiAoIXNlc3Npb24uY292ZXJhZ2UpIHtcblx0XHRcdFx0Y2hhcm0ud3JpdGUoJ05vIHVuaXQgdGVzdCBjb3ZlcmFnZSBmb3IgJyArIHN1aXRlLm5hbWUpXG5cdFx0XHRcdGNoYXJtLmRpc3BsYXkoJ3Jlc2V0Jylcblx0XHRcdFx0Y2hhcm0ud3JpdGUoJ1xcbicpO1xuXHRcdFx0fVxuXG5cdFx0XHRjaGFybS53cml0ZSgnXFxuXFxuJyk7XG5cblx0XHRcdGlmICh0aGlzLl9lcnJvcnNbc3VpdGUuc2Vzc2lvbklkXSkge1xuXHRcdFx0XHR0aGlzLl9lcnJvcnNbc3VpdGUuc2Vzc2lvbklkXS5mb3JFYWNoKCh0ZXN0KSA9PiB7XG5cdFx0XHRcdFx0Y2hhcm0ud3JpdGUoTElHSFRfUkVEKVxuXHRcdFx0XHRcdGNoYXJtLndyaXRlKCfDlyAnICsgdGVzdC5pZClcblx0XHRcdFx0XHRjaGFybS5mb3JlZ3JvdW5kKCd3aGl0ZScpXG5cdFx0XHRcdFx0Y2hhcm0ud3JpdGUoJyAoJyArICh0ZXN0LnRpbWVFbGFwc2VkIC8gMTAwMCkgKyAncyknKVxuXHRcdFx0XHRcdGNoYXJtLndyaXRlKCdcXG4nKVxuXHRcdFx0XHRcdGNoYXJtLmZvcmVncm91bmQoJ3JlZCcpXG5cdFx0XHRcdFx0Y2hhcm0ud3JpdGUodGVzdC5lcnJvcilcblx0XHRcdFx0XHRjaGFybS5kaXNwbGF5KCdyZXNldCcpXG5cdFx0XHRcdFx0Y2hhcm0ud3JpdGUoJ1xcblxcbicpO1xuXHRcdFx0XHR9KTtcblx0XHRcdH1cblxuXHRcdFx0Y29uc3QgbmFtZSA9IHN1aXRlLm5hbWU7XG5cdFx0XHRjb25zdCBoYXNFcnJvciA9IHN1aXRlLmVycm9yIHx8IHNlc3Npb24uaGFzU3VpdGVFcnJvcnM7XG5cdFx0XHRjb25zdCBudW1UZXN0cyA9IHN1aXRlLm51bVRlc3RzO1xuXHRcdFx0Y29uc3QgbnVtRmFpbGVkVGVzdHMgPSBzdWl0ZS5udW1GYWlsZWRUZXN0cztcblx0XHRcdGNvbnN0IG51bVNraXBwZWRUZXN0cyA9IHN1aXRlLm51bVNraXBwZWRUZXN0cztcblxuXHRcdFx0bGV0IHN1bW1hcnkgPSBub2RlVXRpbC5mb3JtYXQoJyVzOiAlZC8lZCB0ZXN0cyBmYWlsZWQnLCBuYW1lLCBudW1GYWlsZWRUZXN0cywgbnVtVGVzdHMpO1xuXHRcdFx0aWYgKG51bVNraXBwZWRUZXN0cykge1xuXHRcdFx0XHRzdW1tYXJ5ICs9ICcgKCcgKyBudW1Ta2lwcGVkVGVzdHMgKyAnIHNraXBwZWQpJztcblx0XHRcdH1cblxuXHRcdFx0aWYgKGhhc0Vycm9yKSB7XG5cdFx0XHRcdHN1bW1hcnkgKz0gJzsgc3VpdGUgZXJyb3Igb2NjdXJyZWQnO1xuXHRcdFx0fVxuXG5cdFx0XHRjaGFybS53cml0ZShudW1GYWlsZWRUZXN0cyB8fCBoYXNFcnJvciA+IDAgPyBMSUdIVF9SRUQgOiBMSUdIVF9HUkVFTilcblx0XHRcdGNoYXJtLndyaXRlKHN1bW1hcnkpXG5cdFx0XHRjaGFybS5kaXNwbGF5KCdyZXNldCcpXG5cdFx0XHRjaGFybS53cml0ZSgnXFxuXFxuJyk7XG5cdFx0fVxuXHR9XG5cblx0QGV2ZW50SGFuZGxlcigpXG5cdHRlc3RFbmQodGVzdDogVGVzdCkge1xuXHRcdGNvbnN0IHsgY2hhcm0gfSA9IHRoaXM7XG5cdFx0aWYgKHRlc3QuZXJyb3IpIHtcblx0XHRcdGlmICghdGhpcy5fZXJyb3JzW3Rlc3Quc2Vzc2lvbklkXSkge1xuXHRcdFx0XHR0aGlzLl9lcnJvcnNbdGVzdC5zZXNzaW9uSWRdID0gW107XG5cdFx0XHR9XG5cblx0XHRcdHRoaXMuX2Vycm9yc1t0ZXN0LnNlc3Npb25JZF0ucHVzaCh7XG5cdFx0XHRcdGlkOiB0ZXN0LmlkLFxuXHRcdFx0XHR0aW1lRWxhcHNlZDogdGVzdC50aW1lRWxhcHNlZCxcblx0XHRcdFx0ZXJyb3I6IHRoaXMuZXhlY3V0b3IuZm9ybWF0RXJyb3IodGVzdC5lcnJvcilcblx0XHRcdH0pO1xuXG5cdFx0XHRjaGFybS53cml0ZShMSUdIVF9SRUQpO1xuXHRcdFx0Y2hhcm0ud3JpdGUoJ8OXJyk7XG5cdFx0fVxuXHRcdGVsc2UgaWYgKHRlc3Quc2tpcHBlZCkge1xuXHRcdFx0Y2hhcm0ud3JpdGUoTElHSFRfTUFHRU5UQSk7XG5cdFx0XHRjaGFybS53cml0ZSgnficpO1xuXHRcdH1cblx0XHRlbHNlIHtcblx0XHRcdGNoYXJtLndyaXRlKExJR0hUX0dSRUVOKTtcblx0XHRcdGNoYXJtLndyaXRlKCfinJMnKTtcblx0XHR9XG5cdFx0Y2hhcm0uZGlzcGxheSgncmVzZXQnKTtcblx0fVxufVxuXG5mdW5jdGlvbiBpc0NvdmVyYWdlTWFwKHZhbHVlOiBhbnkpOiB2YWx1ZSBpcyBDb3ZlcmFnZU1hcCB7XG5cdHJldHVybiB2YWx1ZSAhPSBudWxsICYmIHR5cGVvZiB2YWx1ZS5maWxlcyA9PT0gJ2Z1bmN0aW9uJztcbn1cblxuaW50ZXJuLnJlZ2lzdGVyUGx1Z2luKCdncnVudC1kb2pvMicsICgpID0+IHtcblx0aW50ZXJuLnJlZ2lzdGVyUmVwb3J0ZXIoJ2dydW50LWRvam8yJywgUmVwb3J0ZXIpO1xuXHRjb25zdCByZXBvcnRlcnM6IGFueVtdID0gKDxhbnk+IGludGVybikuX3JlcG9ydGVycyB8fCBbXTtcblxuXHQvLyBJbnRlcm4gY3VycmVudGx5IGluaXRpYWxpemVzIHJlcG9ydGVycyBiZWZvcmUgcGx1Z2lucyBhcmVcblx0Ly8gbG9hZGVkLCBzbyB3ZSBuZWVkIGEgZGVmYXVsdCByZXBvcnRlciB0byByZXBvcnQgZXJyb3JzIHVudGlsIG91clxuXHQvLyByZXBvcnRlciBpcyBpbml0aWFsaXplZC4gVGhlIGRlZmF1bHQgcmVwb3J0ZXJzIGhhdmUgdGhlaXIgZXZlbnRcblx0Ly8gaGFuZGxlcnMgc2V0IHRvIGEgbm9vcCBmdW5jdGlvbiBzbyB0aGV5IGRvbid0IG91dHB1dCBhbnl0aGluZ1xuXHQvLyBhZnRlcndhcmRzLlxuXHRyZXBvcnRlcnMuZm9yRWFjaChyZXBvcnRlciA9PiB7XG5cdFx0T2JqZWN0LmtleXMocmVwb3J0ZXIuX2V2ZW50SGFuZGxlcnMpLmZvckVhY2goa2V5ID0+IHtcblx0XHRcdGNvbnN0IHByb3BlcnR5OiBzdHJpbmcgPSByZXBvcnRlci5fZXZlbnRIYW5kbGVyc1trZXldO1xuXHRcdFx0cmVwb3J0ZXJbcHJvcGVydHldID0gKCkgPT4ge307XG5cdFx0fSk7XG5cdH0pO1xuXG5cdCg8YW55PiBpbnRlcm4pLl9yZXBvcnRlcnMgPSBbXG5cdFx0bmV3IFJlcG9ydGVyKGludGVybilcblx0XTtcbn0pO1xuIl19
