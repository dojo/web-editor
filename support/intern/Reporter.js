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
(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "fs", "util", "path", "intern", "istanbul/lib/collector", "glob", "istanbul/lib/report/json", "istanbul/lib/instrumenter", "istanbul/index", "intern/lib/reporters/Runner", "intern/lib/util"], factory);
    }
})(function (require, exports) {
    "use strict";
    var fs = require("fs");
    var nodeUtil = require("util");
    var path = require("path");
    var intern = require("intern");
    var Collector = require("istanbul/lib/collector");
    var glob = require("glob");
    var JsonReporter = require("istanbul/lib/report/json");
    var Instrumenter = require("istanbul/lib/instrumenter");
    require("istanbul/index");
    var Runner = require("intern/lib/reporters/Runner");
    var util = require("intern/lib/util");
    var LIGHT_RED = '\x1b[91m';
    var LIGHT_GREEN = '\x1b[92m';
    var LIGHT_MAGENTA = '\x1b[95m';
    var Reporter = (function (_super) {
        __extends(Reporter, _super);
        function Reporter(config) {
            if (config === void 0) { config = {}; }
            var _this = _super.call(this, config) || this;
            _this._errors = {};
            _this._filename = config.file || 'coverage-final.json';
            _this._collector = new Collector();
            _this.reporter = {
                writeReport: function () { }
            };
            _this._reporter = new JsonReporter({
                file: _this._filename,
                watermarks: config.watermarks
            });
            return _this;
        }
        Reporter.prototype.coverage = function (sessionId, coverage) {
            if (intern.mode === 'client' || sessionId) {
                var session = this.sessions[sessionId || ''];
                session.coverage = true;
                this._collector.add(coverage);
            }
        };
        Reporter.prototype.runEnd = function () {
            var _this = this;
            var numEnvironments = 0;
            var numTests = 0;
            var numFailedTests = 0;
            var numSkippedTests = 0;
            for (var sessionId in this.sessions) {
                var session = this.sessions[sessionId];
                ++numEnvironments;
                numTests += session.suite.numTests;
                numFailedTests += session.suite.numFailedTests;
                numSkippedTests += session.suite.numSkippedTests;
            }
            this.charm.write('\n');
            if (intern.mode === 'client') {
                for (var sid in this._errors) {
                    this._errors[sid].forEach(function (test) {
                        _this.charm
                            .write(LIGHT_RED)
                            .write('× ' + test.id)
                            .foreground('white')
                            .write(' (' + (test.timeElapsed / 1000) + 's)')
                            .write('\n')
                            .foreground('red')
                            .write(test.error)
                            .display('reset')
                            .write('\n\n');
                    });
                }
            }
            var message = "TOTAL: tested " + numEnvironments + " platforms, " + numFailedTests + "/" + numTests + " failed";
            if (numSkippedTests) {
                message += " (" + numSkippedTests + " skipped)";
            }
            if (this.hasErrors && !numFailedTests) {
                message += '; fatal error occurred';
            }
            this.charm
                .foreground(numFailedTests > 0 || this.hasErrors ? 'red' : 'green')
                .write(message)
                .display('reset')
                .write('\n');
            this._writeCoverage();
        };
        Reporter.prototype.suiteStart = function (suite) {
            if (!suite.hasParent) {
                this.sessions[suite.sessionId || ''] = { suite: suite };
                if (suite.sessionId) {
                    this.charm.write('\n‣ Created session ' + suite.name + ' (' + suite.sessionId + ')\n');
                }
            }
        };
        Reporter.prototype.suiteEnd = function (suite) {
            var _this = this;
            if (!suite.hasParent) {
                // runEnd will report all of this information, so do not repeat it
                if (intern.mode === 'client') {
                    return;
                }
                // Runner mode test with no sessionId was some failed test, not a bug
                if (!suite.sessionId) {
                    return;
                }
                var session = this.sessions[suite.sessionId];
                if (session.coverage) {
                    this.reporter.writeReport(session.coverage);
                }
                else {
                    this.charm
                        .write('No unit test coverage for ' + suite.name)
                        .display('reset')
                        .write('\n');
                }
                this.charm
                    .write('\n\n');
                if (this._errors[suite.sessionId]) {
                    this._errors[suite.sessionId].forEach(function (test) {
                        _this.charm
                            .write(LIGHT_RED)
                            .write('× ' + test.id)
                            .foreground('white')
                            .write(' (' + (test.timeElapsed / 1000) + 's)')
                            .write('\n')
                            .foreground('red')
                            .write(test.error)
                            .display('reset')
                            .write('\n\n');
                    });
                }
                var name_1 = suite.name;
                var hasError = (function hasError(suite) {
                    return suite.tests ? (suite.error || suite.tests.some(hasError)) : false;
                })(suite);
                var numFailedTests = suite.numFailedTests;
                var numTests = suite.numTests;
                var numSkippedTests = suite.numSkippedTests;
                var summary = nodeUtil.format('%s: %d/%d tests failed', name_1, numFailedTests, numTests);
                if (numSkippedTests) {
                    summary += ' (' + numSkippedTests + ' skipped)';
                }
                if (hasError) {
                    summary += '; fatal error occurred';
                }
                this.charm
                    .write(numFailedTests || hasError > 0 ? LIGHT_RED : LIGHT_GREEN)
                    .write(summary)
                    .display('reset')
                    .write('\n\n');
            }
        };
        Reporter.prototype.testFail = function (test) {
            if (!this._errors[test.sessionId]) {
                this._errors[test.sessionId] = [];
            }
            this._errors[test.sessionId].push({
                id: test.id,
                timeElapsed: test.timeElapsed,
                error: util.getErrorMessage(test.error)
            });
            this.charm
                .write(LIGHT_RED)
                .write('×')
                .display('reset');
        };
        Reporter.prototype.testPass = function (test) {
            this.charm
                .write(LIGHT_GREEN)
                .write('✓')
                .display('reset');
        };
        Reporter.prototype.testSkip = function (test) {
            this.charm
                .write(LIGHT_MAGENTA)
                .write('~')
                .display('reset');
        };
        Reporter.prototype._writeCoverage = function () {
            var coverage;
            if (fs.existsSync(this._filename)) {
                coverage = JSON.parse(fs.readFileSync(this._filename, { encoding: 'utf8' }));
            }
            else {
                coverage = {};
                var coveredFiles_1 = this._collector.files();
                var instrumenter_1 = new Instrumenter({
                    noCompact: true,
                    noAutoWrap: true
                });
                glob.sync('_build/**/*.js').filter(function (filepath) {
                    return !intern.executor.config.excludeInstrumentation.test(filepath) && coveredFiles_1.indexOf(path.resolve(filepath)) === -1;
                }).forEach(function (filepath) {
                    try {
                        var wholename = path.resolve(filepath);
                        instrumenter_1.instrumentSync(fs.readFileSync(wholename, 'utf8'), wholename);
                        coverage[wholename] = instrumenter_1.lastFileCoverage();
                        for (var i in coverage[wholename].s) {
                            coverage[wholename].s[i] = 0;
                        }
                    }
                    catch (error) {
                        console.error(filepath + ': ' + error);
                    }
                });
            }
            this._collector.add(coverage);
            this._reporter.writeReport(this._collector, true);
        };
        return Reporter;
    }(Runner));
    return Reporter;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUmVwb3J0ZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJSZXBvcnRlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7OztJQUFBLHVCQUF5QjtJQUN6QiwrQkFBaUM7SUFDakMsMkJBQTZCO0lBQzdCLCtCQUFpQztJQUNqQyxrREFBcUQ7SUFDckQsMkJBQThCO0lBQzlCLHVEQUEwRDtJQUMxRCx3REFBMkQ7SUFDM0QsMEJBQXdCO0lBRXhCLG9EQUF1RDtJQUN2RCxzQ0FBeUM7SUFFekMsSUFBTSxTQUFTLEdBQUcsVUFBVSxDQUFDO0lBQzdCLElBQU0sV0FBVyxHQUFHLFVBQVUsQ0FBQztJQUMvQixJQUFNLGFBQWEsR0FBRyxVQUFVLENBQUM7SUFFakM7UUFBdUIsNEJBQU07UUFPNUIsa0JBQVksTUFBZ0I7WUFBaEIsdUJBQUEsRUFBQSxXQUFnQjtZQUE1QixZQUNDLGtCQUFNLE1BQU0sQ0FBQyxTQVdiO1lBZE8sYUFBTyxHQUFvQyxFQUFFLENBQUM7WUFLckQsS0FBSSxDQUFDLFNBQVMsR0FBRyxNQUFNLENBQUMsSUFBSSxJQUFJLHFCQUFxQixDQUFDO1lBQ3RELEtBQUksQ0FBQyxVQUFVLEdBQUcsSUFBSSxTQUFTLEVBQUUsQ0FBQztZQUNsQyxLQUFJLENBQUMsUUFBUSxHQUFHO2dCQUNmLFdBQVcsRUFBRSxjQUFhLENBQUM7YUFDM0IsQ0FBQztZQUNGLEtBQUksQ0FBQyxTQUFTLEdBQUcsSUFBSSxZQUFZLENBQUM7Z0JBQ2pDLElBQUksRUFBRSxLQUFJLENBQUMsU0FBUztnQkFDcEIsVUFBVSxFQUFFLE1BQU0sQ0FBQyxVQUFVO2FBQzdCLENBQUMsQ0FBQzs7UUFDSixDQUFDO1FBRUQsMkJBQVEsR0FBUixVQUFTLFNBQWlCLEVBQUUsUUFBYTtZQUN4QyxFQUFFLENBQUMsQ0FBQyxNQUFNLENBQUMsSUFBSSxLQUFLLFFBQVEsSUFBSSxTQUFTLENBQUMsQ0FBQyxDQUFDO2dCQUMzQyxJQUFNLE9BQU8sR0FBRyxJ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ZUFBQztJQUFELENBQUMsQUExTkQsQ0FBdUIsTUFBTSxHQTBONUI7SUFFRCxPQUFTLFFBQVEsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCAqIGFzIGZzIGZyb20gJ2ZzJztcbmltcG9ydCAqIGFzIG5vZGVVdGlsIGZyb20gJ3V0aWwnO1xuaW1wb3J0ICogYXMgcGF0aCBmcm9tICdwYXRoJztcbmltcG9ydCAqIGFzIGludGVybiBmcm9tICdpbnRlcm4nO1xuaW1wb3J0IENvbGxlY3RvciA9IHJlcXVpcmUoJ2lzdGFuYnVsL2xpYi9jb2xsZWN0b3InKTtcbmltcG9ydCBnbG9iID0gcmVxdWlyZSgnZ2xvYicpO1xuaW1wb3J0IEpzb25SZXBvcnRlciA9IHJlcXVpcmUoJ2lzdGFuYnVsL2xpYi9yZXBvcnQvanNvbicpO1xuaW1wb3J0IEluc3RydW1lbnRlciA9IHJlcXVpcmUoJ2lzdGFuYnVsL2xpYi9pbnN0cnVtZW50ZXInKTtcbmltcG9ydCAnaXN0YW5idWwvaW5kZXgnO1xuXG5pbXBvcnQgUnVubmVyID0gcmVxdWlyZSgnaW50ZXJuL2xpYi9yZXBvcnRlcnMvUnVubmVyJyk7XG5pbXBvcnQgdXRpbCA9IHJlcXVpcmUoJ2ludGVybi9saWIvdXRpbCcpO1xuXG5jb25zdCBMSUdIVF9SRUQgPSAnXFx4MWJbOTFtJztcbmNvbnN0IExJR0hUX0dSRUVOID0gJ1xceDFiWzkybSc7XG5jb25zdCBMSUdIVF9NQUdFTlRBID0gJ1xceDFiWzk1bSc7XG5cbmNsYXNzIFJlcG9ydGVyIGV4dGVuZHMgUnVubmVyIHtcblx0cHJpdmF0ZSBfZmlsZW5hbWU6IHN0cmluZztcblx0cHJpdmF0ZSBfY29sbGVjdG9yOiBDb2xsZWN0b3I7XG5cdHByaXZhdGUgX3JlcG9ydGVyOiBKc29uUmVwb3J0ZXI7XG5cdHByaXZhdGUgcmVwb3J0ZXI6IGFueTtcblx0cHJpdmF0ZSBfZXJyb3JzOiB7IFtzZXNzaW9uSWQ6IHN0cmluZyBdOiBhbnlbXSB9ID0ge307XG5cblx0Y29uc3RydWN0b3IoY29uZmlnOiBhbnkgPSB7fSkge1xuXHRcdHN1cGVyKGNvbmZpZyk7XG5cblx0XHR0aGlzLl9maWxlbmFtZSA9IGNvbmZpZy5maWxlIHx8ICdjb3ZlcmFnZS1maW5hbC5qc29uJztcblx0XHR0aGlzLl9jb2xsZWN0b3IgPSBuZXcgQ29sbGVjdG9yKCk7XG5cdFx0dGhpcy5yZXBvcnRlciA9IHtcblx0XHRcdHdyaXRlUmVwb3J0OiBmdW5jdGlvbiAoKSB7fVxuXHRcdH07XG5cdFx0dGhpcy5fcmVwb3J0ZXIgPSBuZXcgSnNvblJlcG9ydGVyKHtcblx0XHRcdGZpbGU6IHRoaXMuX2ZpbGVuYW1lLFxuXHRcdFx0d2F0ZXJtYXJrczogY29uZmlnLndhdGVybWFya3Ncblx0XHR9KTtcblx0fVxuXG5cdGNvdmVyYWdlKHNlc3Npb25JZDogc3RyaW5nLCBjb3ZlcmFnZTogYW55KSB7XG5cdFx0aWYgKGludGVybi5tb2RlID09PSAnY2xpZW50JyB8fCBzZXNzaW9uSWQpIHtcblx0XHRcdGNvbnN0IHNlc3Npb24gPSB0aGlzLnNlc3Npb25zW3Nlc3Npb25JZCB8fCAnJ107XG5cdFx0XHRzZXNzaW9uLmNvdmVyYWdlID0gdHJ1ZTtcblx0XHRcdHRoaXMuX2NvbGxlY3Rvci5hZGQoY292ZXJhZ2UpO1xuXHRcdH1cblx0fVxuXG5cdHJ1bkVuZCgpIHtcblx0XHRsZXQgbnVtRW52aXJvbm1lbnRzID0gMDtcblx0XHRsZXQgbnVtVGVzdHMgPSAwO1xuXHRcdGxldCBudW1GYWlsZWRUZXN0cyA9IDA7XG5cdFx0bGV0IG51bVNraXBwZWRUZXN0cyA9IDA7XG5cblx0XHRmb3IgKGNvbnN0IHNlc3Npb25JZCBpbiB0aGlzLnNlc3Npb25zKSB7XG5cdFx0XHRjb25zdCBzZXNzaW9uID0gdGhpcy5zZXNzaW9uc1tzZXNzaW9uSWRdO1xuXHRcdFx0KytudW1FbnZpcm9ubWVudHM7XG5cdFx0XHRudW1UZXN0cyArPSBzZXNzaW9uLnN1aXRlLm51bVRlc3RzO1xuXHRcdFx0bnVtRmFpbGVkVGVzdHMgKz0gc2Vzc2lvbi5zdWl0ZS5udW1GYWlsZWRUZXN0cztcblx0XHRcdG51bVNraXBwZWRUZXN0cyArPSBzZXNzaW9uLnN1aXRlLm51bVNraXBwZWRUZXN0cztcblx0XHR9XG5cblx0XHR0aGlzLmNoYXJtLndyaXRlKCdcXG4nKTtcblxuXHRcdGlmIChpbnRlcm4ubW9kZSA9PT0gJ2NsaWVudCcpIHtcblx0XHRcdGZvciAobGV0IHNpZCBpbiB0aGlzLl9lcnJvcnMpIHtcblx0XHRcdFx0dGhpcy5fZXJyb3JzW3NpZF0uZm9yRWFjaCgodGVzdCkgPT4ge1xuXHRcdFx0XHRcdHRoaXMuY2hhcm1cblx0XHRcdFx0XHRcdC53cml0ZShMSUdIVF9SRUQpXG5cdFx0XHRcdFx0XHQud3JpdGUoJ8OXICcgKyB0ZXN0LmlkKVxuXHRcdFx0XHRcdFx0LmZvcmVncm91bmQoJ3doaXRlJylcblx0XHRcdFx0XHRcdC53cml0ZSgnICgnICsgKHRlc3QudGltZUVsYXBzZWQgLyAxMDAwKSArICdzKScpXG5cdFx0XHRcdFx0XHQud3JpdGUoJ1xcbicpXG5cdFx0XHRcdFx0XHQuZm9yZWdyb3VuZCgncmVkJylcblx0XHRcdFx0XHRcdC53cml0ZSh0ZXN0LmVycm9yKVxuXHRcdFx0XHRcdFx0LmRpc3BsYXkoJ3Jlc2V0Jylcblx0XHRcdFx0XHRcdC53cml0ZSgnXFxuXFxuJyk7XG5cdFx0XHRcdH0pO1xuXHRcdFx0fVxuXHRcdH1cblxuXHRcdGxldCBtZXNzYWdlID0gYFRPVEFMOiB0ZXN0ZWQgJHtudW1FbnZpcm9ubWVudHN9IHBsYXRmb3JtcywgJHtudW1GYWlsZWRUZXN0c30vJHtudW1UZXN0c30gZmFpbGVkYDtcblxuXHRcdGlmIChudW1Ta2lwcGVkVGVzdHMpIHtcblx0XHRcdG1lc3NhZ2UgKz0gYCAoJHtudW1Ta2lwcGVkVGVzdHN9IHNraXBwZWQpYDtcblx0XHR9XG5cdFx0aWYgKHRoaXMuaGFzRXJyb3JzICYmICFudW1GYWlsZWRUZXN0cykge1xuXHRcdFx0bWVzc2FnZSArPSAnOyBmYXRhbCBlcnJvciBvY2N1cnJlZCc7XG5cdFx0fVxuXG5cdFx0dGhpcy5jaGFybVxuXHRcdFx0LmZvcmVncm91bmQobnVtRmFpbGVkVGVzdHMgPiAwIHx8IHRoaXMuaGFzRXJyb3JzID8gJ3JlZCcgOiAnZ3JlZW4nKVxuXHRcdFx0LndyaXRlKG1lc3NhZ2UpXG5cdFx0XHQuZGlzcGxheSgncmVzZXQnKVxuXHRcdFx0LndyaXRlKCdcXG4nKTtcblxuXHRcdHRoaXMuX3dyaXRlQ292ZXJhZ2UoKTtcblx0fVxuXG5cdHN1aXRlU3RhcnQoc3VpdGU6IGFueSk6IHZvaWQge1xuXHRcdGlmICghc3VpdGUuaGFzUGFyZW50KSB7XG5cdFx0XHR0aGlzLnNlc3Npb25zW3N1aXRlLnNlc3Npb25JZCB8fCAnJ10gPSB7IHN1aXRlOiBzdWl0ZSB9O1xuXHRcdFx0aWYgKHN1aXRlLnNlc3Npb25JZCkge1xuXHRcdFx0XHR0aGlzLmNoYXJtLndyaXRlKCdcXG7igKMgQ3JlYXRlZCBzZXNzaW9uICcgKyBzdWl0ZS5uYW1lICsgJyAoJyArIHN1aXRlLnNlc3Npb25JZCArICcpXFxuJyk7XG5cdFx0XHR9XG5cdFx0fVxuXHR9XG5cblx0c3VpdGVFbmQoc3VpdGU6IGFueSk6IHZvaWQge1xuXHRcdGlmICghc3VpdGUuaGFzUGFyZW50KSB7XG5cdFx0XHQvLyBydW5FbmQgd2lsbCByZXBvcnQgYWxsIG9mIHRoaXMgaW5mb3JtYXRpb24sIHNvIGRvIG5vdCByZXBlYXQgaXRcblx0XHRcdGlmIChpbnRlcm4ubW9kZSA9PT0gJ2NsaWVudCcpIHtcblx0XHRcdFx0cmV0dXJuO1xuXHRcdFx0fVxuXG5cdFx0XHQvLyBSdW5uZXIgbW9kZSB0ZXN0IHdpdGggbm8gc2Vzc2lvbklkIHdhcyBzb21lIGZhaWxlZCB0ZXN0LCBub3QgYSBidWdcblx0XHRcdGlmICghc3VpdGUuc2Vzc2lvbklkKSB7XG5cdFx0XHRcdHJldHVybjtcblx0XHRcdH1cblxuXHRcdFx0Y29uc3Qgc2Vzc2lvbiA9IHRoaXMuc2Vzc2lvbnNbc3VpdGUuc2Vzc2lvbklkXTtcblxuXHRcdFx0aWYgKHNlc3Npb24uY292ZXJhZ2UpIHtcblx0XHRcdFx0dGhpcy5yZXBvcnRlci53cml0ZVJlcG9ydChzZXNzaW9uLmNvdmVyYWdlKTtcblx0XHRcdH1cblx0XHRcdGVsc2Uge1xuXHRcdFx0XHR0aGlzLmNoYXJtXG5cdFx0XHRcdFx0LndyaXRlKCdObyB1bml0IHRlc3QgY292ZXJhZ2UgZm9yICcgKyBzdWl0ZS5uYW1lKVxuXHRcdFx0XHRcdC5kaXNwbGF5KCdyZXNldCcpXG5cdFx0XHRcdFx0LndyaXRlKCdcXG4nKTtcblx0XHRcdH1cblxuXHRcdFx0dGhpcy5jaGFybVxuXHRcdFx0XHQud3JpdGUoJ1xcblxcbicpO1xuXG5cdFx0XHRpZiAodGhpcy5fZXJyb3JzW3N1aXRlLnNlc3Npb25JZF0pIHtcblx0XHRcdFx0dGhpcy5fZXJyb3JzW3N1aXRlLnNlc3Npb25JZF0uZm9yRWFjaCgodGVzdCkgPT4ge1xuXHRcdFx0XHRcdHRoaXMuY2hhcm1cblx0XHRcdFx0XHRcdC53cml0ZShMSUdIVF9SRUQpXG5cdFx0XHRcdFx0XHQud3JpdGUoJ8OXICcgKyB0ZXN0LmlkKVxuXHRcdFx0XHRcdFx0LmZvcmVncm91bmQoJ3doaXRlJylcblx0XHRcdFx0XHRcdC53cml0ZSgnICgnICsgKHRlc3QudGltZUVsYXBzZWQgLyAxMDAwKSArICdzKScpXG5cdFx0XHRcdFx0XHQud3JpdGUoJ1xcbicpXG5cdFx0XHRcdFx0XHQuZm9yZWdyb3VuZCgncmVkJylcblx0XHRcdFx0XHRcdC53cml0ZSh0ZXN0LmVycm9yKVxuXHRcdFx0XHRcdFx0LmRpc3BsYXkoJ3Jlc2V0Jylcblx0XHRcdFx0XHRcdC53cml0ZSgnXFxuXFxuJyk7XG5cdFx0XHRcdH0pO1xuXHRcdFx0fVxuXG5cdFx0XHRjb25zdCBuYW1lID0gc3VpdGUubmFtZTtcblx0XHRcdGNvbnN0IGhhc0Vycm9yID0gKGZ1bmN0aW9uIGhhc0Vycm9yKHN1aXRlOiBhbnkpIHtcblx0XHRcdFx0cmV0dXJuIHN1aXRlLnRlc3RzID8gKHN1aXRlLmVycm9yIHx8IHN1aXRlLnRlc3RzLnNvbWUoaGFzRXJyb3IpKSA6IGZhbHNlO1xuXHRcdFx0fSkoc3VpdGUpO1xuXHRcdFx0Y29uc3QgbnVtRmFpbGVkVGVzdHMgPSBzdWl0ZS5udW1GYWlsZWRUZXN0cztcblx0XHRcdGNvbnN0IG51bVRlc3RzID0gc3VpdGUubnVtVGVzdHM7XG5cdFx0XHRjb25zdCBudW1Ta2lwcGVkVGVzdHMgPSBzdWl0ZS5udW1Ta2lwcGVkVGVzdHM7XG5cblx0XHRcdGxldCBzdW1tYXJ5ID0gbm9kZVV0aWwuZm9ybWF0KCclczogJWQvJWQgdGVzdHMgZmFpbGVkJywgbmFtZSwgbnVtRmFpbGVkVGVzdHMsIG51bVRlc3RzKTtcblx0XHRcdGlmIChudW1Ta2lwcGVkVGVzdHMpIHtcblx0XHRcdFx0c3VtbWFyeSArPSAnICgnICsgbnVtU2tpcHBlZFRlc3RzICsgJyBza2lwcGVkKSc7XG5cdFx0XHR9XG5cblx0XHRcdGlmIChoYXNFcnJvcikge1xuXHRcdFx0XHRzdW1tYXJ5ICs9ICc7IGZhdGFsIGVycm9yIG9jY3VycmVkJztcblx0XHRcdH1cblxuXHRcdFx0dGhpcy5jaGFybVxuXHRcdFx0XHQud3JpdGUobnVtRmFpbGVkVGVzdHMgfHwgaGFzRXJyb3IgPiAwID8gTElHSFRfUkVEIDogTElHSFRfR1JFRU4pXG5cdFx0XHRcdC53cml0ZShzdW1tYXJ5KVxuXHRcdFx0XHQuZGlzcGxheSgncmVzZXQnKVxuXHRcdFx0XHQud3JpdGUoJ1xcblxcbicpO1xuXHRcdH1cblx0fVxuXG5cdHRlc3RGYWlsKHRlc3Q6IGFueSk6IHZvaWQge1xuXHRcdGlmICghdGhpcy5fZXJyb3JzW3Rlc3Quc2Vzc2lvbklkXSkge1xuXHRcdFx0dGhpcy5fZXJyb3JzW3Rlc3Quc2Vzc2lvbklkXSA9IFtdO1xuXHRcdH1cblxuXHRcdHRoaXMuX2Vycm9yc1t0ZXN0LnNlc3Npb25JZF0ucHVzaCh7XG5cdFx0XHRpZDogdGVzdC5pZCxcblx0XHRcdHRpbWVFbGFwc2VkOiB0ZXN0LnRpbWVFbGFwc2VkLFxuXHRcdFx0ZXJyb3I6IHV0aWwuZ2V0RXJyb3JNZXNzYWdlKHRlc3QuZXJyb3IpXG5cdFx0fSk7XG5cblx0XHR0aGlzLmNoYXJtXG5cdFx0XHQud3JpdGUoTElHSFRfUkVEKVxuXHRcdFx0LndyaXRlKCfDlycpXG5cdFx0XHQuZGlzcGxheSgncmVzZXQnKTtcblx0fVxuXG5cdHRlc3RQYXNzKHRlc3Q6IGFueSk6IHZvaWQge1xuXHRcdHRoaXMuY2hhcm1cblx0XHRcdC53cml0ZShMSUdIVF9HUkVFTilcblx0XHRcdC53cml0ZSgn4pyTJylcblx0XHRcdC5kaXNwbGF5KCdyZXNldCcpO1xuXHR9XG5cblx0dGVzdFNraXAodGVzdDogYW55KTogdm9pZCB7XG5cdFx0dGhpcy5jaGFybVxuXHRcdFx0LndyaXRlKExJR0hUX01BR0VOVEEpXG5cdFx0XHQud3JpdGUoJ34nKVxuXHRcdFx0LmRpc3BsYXkoJ3Jlc2V0Jyk7XG5cdH1cblxuXHRfd3JpdGVDb3ZlcmFnZSgpOiB2b2lkIHtcblx0XHRsZXQgY292ZXJhZ2U6IGFueTtcblx0XHRpZiAoZnMuZXhpc3RzU3luYyh0aGlzLl9maWxlbmFtZSkpIHtcblx0XHRcdGNvdmVyYWdlID0gSlNPTi5wYXJzZShmcy5yZWFkRmlsZVN5bmModGhpcy5fZmlsZW5hbWUsIHsgZW5jb2Rpbmc6ICd1dGY4JyB9KSk7XG5cdFx0fVxuXHRcdGVsc2Uge1xuXHRcdFx0Y292ZXJhZ2UgPSB7fTtcblx0XHRcdGNvbnN0IGNvdmVyZWRGaWxlcyA9IHRoaXMuX2NvbGxlY3Rvci5maWxlcygpO1xuXHRcdFx0Y29uc3QgaW5zdHJ1bWVudGVyID0gbmV3IEluc3RydW1lbnRlcih7XG5cdFx0XHRcdG5vQ29tcGFjdDogdHJ1ZSxcblx0XHRcdFx0bm9BdXRvV3JhcDogdHJ1ZVxuXHRcdFx0fSk7XG5cdFx0XHRnbG9iLnN5bmMoJ19idWlsZC8qKi8qLmpzJykuZmlsdGVyKGZ1bmN0aW9uIChmaWxlcGF0aCkge1xuXHRcdFx0XHRyZXR1cm4gISg8YW55PiBpbnRlcm4uZXhlY3V0b3IpLmNvbmZpZy5leGNsdWRlSW5zdHJ1bWVudGF0aW9uLnRlc3QoZmlsZXBhdGgpICYmIGNvdmVyZWRGaWxlcy5pbmRleE9mKHBhdGgucmVzb2x2ZShmaWxlcGF0aCkpID09PSAtMTtcblx0XHRcdH0pLmZvckVhY2goZnVuY3Rpb24gKGZpbGVwYXRoKSB7XG5cdFx0XHRcdHRyeSB7XG5cdFx0XHRcdFx0Y29uc3Qgd2hvbGVuYW1lID0gcGF0aC5yZXNvbHZlKGZpbGVwYXRoKTtcblx0XHRcdFx0XHRpbnN0cnVtZW50ZXIuaW5zdHJ1bWVudFN5bmMoZnMucmVhZEZpbGVTeW5jKHdob2xlbmFtZSwgJ3V0ZjgnKSwgd2hvbGVuYW1lKTtcblx0XHRcdFx0XHRjb3ZlcmFnZVt3aG9sZW5hbWVdID0gaW5zdHJ1bWVudGVyLmxhc3RGaWxlQ292ZXJhZ2UoKTtcblx0XHRcdFx0XHRmb3IgKGxldCBpIGluIGNvdmVyYWdlW3dob2xlbmFtZV0ucykge1xuXHRcdFx0XHRcdFx0Y292ZXJhZ2Vbd2hvbGVuYW1lXS5zW2ldID0gMDtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblx0XHRcdFx0Y2F0Y2ggKGVycm9yKSB7XG5cdFx0XHRcdFx0Y29uc29sZS5lcnJvcihmaWxlcGF0aCArICc6ICcgKyBlcnJvcik7XG5cdFx0XHRcdH1cblx0XHRcdH0pO1xuXHRcdH1cblx0XHR0aGlzLl9jb2xsZWN0b3IuYWRkKGNvdmVyYWdlKTtcblx0XHR0aGlzLl9yZXBvcnRlci53cml0ZVJlcG9ydCh0aGlzLl9jb2xsZWN0b3IsIHRydWUpO1xuXHR9XG59XG5cbmV4cG9ydCA9IFJlcG9ydGVyO1xuIl19