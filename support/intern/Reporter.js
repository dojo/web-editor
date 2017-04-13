(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "istanbul", "fs", "chalk", "intern", "intern/lib/reporters/Runner", "intern/lib/util", "istanbul/lib/collector", "istanbul/lib/report/json", "util"], factory);
    }
})(function (require, exports) {
    "use strict";
    require("istanbul"); /* import for side-effects */
    const fs_1 = require("fs");
    const chalk_1 = require("chalk");
    const intern = require("intern");
    const Runner = require("intern/lib/reporters/Runner");
    const util = require("intern/lib/util");
    const Collector = require("istanbul/lib/collector");
    const JsonReporter = require("istanbul/lib/report/json");
    const nodeUtil = require("util");
    const DEFAULT_COVERAGE_FILENAME = 'coverage-final.json';
    class Reporter extends Runner {
        constructor(config = {}) {
            super(config);
            this._collector = new Collector();
            this._errors = {};
            this._filename = config.file || DEFAULT_COVERAGE_FILENAME;
            this.reporter = new JsonReporter({
                file: this._filename,
                watermarks: config.watermarks
            });
            this._output = config.output;
            this._mode = config.mode || intern.mode;
        }
        _writeCoverage() {
            function checkCoverageFinal() {
                try {
                    fs_1.accessSync(DEFAULT_COVERAGE_FILENAME, fs_1.constants.R_OK);
                }
                catch (e) {
                    return false;
                }
                return true;
            }
            if (checkCoverageFinal()) {
                /* There is already coverage collected from a previous run */
                this._collector.add(JSON.parse(fs_1.readFileSync(this._filename, { encoding: 'utf8' })));
            }
            this.reporter.writeReport(this._collector, true);
        }
        coverage(sessionId, coverage) {
            if (this._mode === 'client' || sessionId) {
                const session = this.sessions[sessionId || ''];
                session.coverage = true;
                this._collector.add(coverage);
            }
        }
        runEnd() {
            let numEnvironments = 0;
            let numTests = 0;
            let numFailedTests = 0;
            let numSkippedTests = 0;
            for (const sessionId in this.sessions) {
                const session = this.sessions[sessionId];
                ++numEnvironments;
                numTests += session.suite.numTests;
                numFailedTests += session.suite.numFailedTests;
                numSkippedTests += session.suite.numSkippedTests;
            }
            console.log(); /* for log spacing benefits */
            if (numFailedTests > 0) {
                console.log(chalk_1.red.bold(`\nReported Test Errors:\n`));
            }
            for (let sid in this._errors) {
                this._errors[sid].forEach((test) => {
                    console.log(chalk_1.red('x ') +
                        chalk_1.white.bold(test.id) +
                        chalk_1.white(` (${test.timeElapsed / 1000}s)\n`) +
                        chalk_1.red(test.error), '\n');
                });
            }
            let message = chalk_1.bold('\n  TOTAL') + `: tested ${numEnvironments} platforms, ${numFailedTests}/${numTests} failed`;
            if (numSkippedTests) {
                message += ` (${numSkippedTests} skipped)`;
            }
            if (this.hasErrors && !numFailedTests) {
                message += '; fatal error occurred';
            }
            console.log((numFailedTests > 0 || this.hasErrors ? chalk_1.red : chalk_1.green)(message));
            this._writeCoverage();
        }
        suiteStart(suite) {
            if (!suite.parent) {
                this.sessions[suite.sessionId || ''] = { suite: suite };
                if (suite.sessionId) {
                    console.log('\n  ' + chalk_1.yellow('created') + ` session ${suite.name} (${suite.sessionId})...`);
                }
            }
        }
        suiteEnd(suite) {
            if (suite.parent || this._mode === 'client' || !suite.sessionId) {
                return;
            }
            console.log('\n');
            const { name, numFailedTests, numTests, numSkippedTests } = suite;
            const hasError = (function hasError(suite) {
                const { tests, error } = suite;
                return tests ? (error || tests.some(hasError)) : false;
            })(suite);
            let summary = nodeUtil.format('%s: %d/%d tests failed', name, numFailedTests, numTests);
            if (numSkippedTests) {
                summary += ' (' + numSkippedTests + ' skipped)';
            }
            if (hasError) {
                summary += '; fatal error occurred';
            }
            console.log((numFailedTests || hasError > 0 ? chalk_1.red : chalk_1.green)(summary) + '\n');
        }
        testFail(test) {
            if (!this._errors[test.sessionId]) {
                this._errors[test.sessionId] = [];
            }
            this._errors[test.sessionId].push({
                id: test.id,
                timeElapsed: test.timeElapsed,
                error: util.getErrorMessage(test.error)
            });
            this._output.write(chalk_1.red('×'));
        }
        testPass() {
            this._output.write(chalk_1.green('✓'));
        }
        testSkip() {
            this._output.write(chalk_1.grey('~'));
        }
    }
    return Reporter;
});
