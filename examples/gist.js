var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = y[op[0] & 2 ? "return" : op[0] ? "throw" : "next"]) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [0, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "../Editor", "../project", "../Runner", "../support/getGists"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var Editor_1 = require("../Editor");
    var project_1 = require("../project");
    var Runner_1 = require("../Runner");
    var getGists_1 = require("../support/getGists");
    var usernameInput = document.getElementById('username');
    var loadGistsButton = document.getElementById('load-gists');
    var projectListDiv = document.getElementById('project-list');
    var projectSelect = document.getElementById('project');
    var loadProjectButton = document.getElementById('load-project');
    var fileListDiv = document.getElementById('file-list');
    var selectFileSelect = document.getElementById('select-file');
    var runButton = document.getElementById('run');
    var editorDiv = document.getElementById('editor');
    var runnerIframe = document.getElementById('runner');
    var editor = new Editor_1.default(editorDiv);
    var runner = new Runner_1.default(runnerIframe);
    function runButtonClick(evt) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        evt.preventDefault();
                        runButton.setAttribute('disabled', 'disabled');
                        return [4 /*yield*/, runner.run()];
                    case 1:
                        _a.sent();
                        runButton.removeAttribute('disabled');
                        return [2 /*return*/];
                }
            });
        });
    }
    function selectFileSelectChange(evt) {
        evt.preventDefault();
        editor.display(selectFileSelect.value);
    }
    function loadProjectButtonClick() {
        return __awaiter(this, void 0, void 0, function () {
            var projectBundle;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        projectSelect.setAttribute('disabled', 'disabled');
                        loadProjectButton.setAttribute('disabled', 'disabled');
                        return [4 /*yield*/, project_1.default.load(projectSelect.value)];
                    case 1:
                        _a.sent();
                        projectBundle = project_1.default.get();
                        console.log("Loaded. Project contains " + (projectBundle.files.length + projectBundle.environmentFiles.length) + " files.");
                        /* generate UI for selecting a file */
                        project_1.default.getFileNames()
                            .sort(function (a, b) { return a < b ? -1 : 1; })
                            .forEach(function (name) {
                            var option = document.createElement('option');
                            option.value = name;
                            option.text = name;
                            selectFileSelect.appendChild(option);
                        });
                        selectFileSelect.addEventListener('change', selectFileSelectChange);
                        editor.display(selectFileSelect.value);
                        runButton.addEventListener('click', runButtonClick);
                        fileListDiv.classList.remove('hidden');
                        return [2 /*return*/];
                }
            });
        });
    }
    function loadGistsButtonClick() {
        return __awaiter(this, void 0, void 0, function () {
            var username, gists;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        username = usernameInput.value;
                        console.log("Loading gists for \"" + username + "\"...");
                        if (!username) {
                            return [2 /*return*/];
                        }
                        loadGistsButton.setAttribute('disabled', 'disabled');
                        return [4 /*yield*/, getGists_1.default(username)];
                    case 1:
                        gists = _a.sent();
                        if (!gists.length) {
                            console.warn('No valid gists found.');
                            loadGistsButton.removeAttribute('disabled');
                            return [2 /*return*/];
                        }
                        loadGistsButton.removeEventListener('click', loadGistsButtonClick);
                        gists.forEach(function (_a) {
                            var description = _a.description, projectJson = _a.projectJson;
                            var option = document.createElement('option');
                            option.value = projectJson;
                            option.text = description;
                            projectSelect.appendChild(option);
                        });
                        loadProjectButton.addEventListener('click', loadProjectButtonClick);
                        projectListDiv.classList.remove('hidden');
                        return [2 /*return*/];
                }
            });
        });
    }
    loadGistsButton.addEventListener('click', loadGistsButtonClick);
    loadGistsButton.removeAttribute('disabled');
});
//# sourceMappingURL=gist.js.map