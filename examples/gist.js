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
        define(["require", "exports", "@dojo/routing/Route", "@dojo/shim/Map", "../Editor", "../project", "../Runner", "../support/gists", "./router"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var Route_1 = require("@dojo/routing/Route");
    var Map_1 = require("@dojo/shim/Map");
    var Editor_1 = require("../Editor");
    var project_1 = require("../project");
    var Runner_1 = require("../Runner");
    var gists_1 = require("../support/gists");
    var router_1 = require("./router");
    var titleH2 = document.getElementById('title');
    var githubUsernameDiv = document.getElementById('github-username');
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
    var gistIDMap = new Map_1.default();
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
    function loadProject(filename) {
        return __awaiter(this, void 0, void 0, function () {
            var projectBundle;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, project_1.default.load(filename)];
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
    function loadProjectButtonClick() {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        projectSelect.setAttribute('disabled', 'disabled');
                        loadProjectButton.setAttribute('disabled', 'disabled');
                        return [4 /*yield*/, loadProject(projectSelect.value)];
                    case 1:
                        _a.sent();
                        titleH2.textContent = projectSelect.selectedOptions[0].text;
                        router_1.default.setPath(gistIDMap.get(projectSelect.value));
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
                        return [4 /*yield*/, gists_1.getByUsername(username)];
                    case 1:
                        gists = _a.sent();
                        if (!gists.length) {
                            console.warn('No valid gists found.');
                            loadGistsButton.removeAttribute('disabled');
                            return [2 /*return*/];
                        }
                        loadGistsButton.removeEventListener('click', loadGistsButtonClick);
                        gists.forEach(function (_a) {
                            var description = _a.description, id = _a.id, projectJson = _a.projectJson;
                            var option = document.createElement('option');
                            option.value = projectJson;
                            option.text = description;
                            gistIDMap.set(projectJson, id);
                            projectSelect.appendChild(option);
                        });
                        loadProjectButton.addEventListener('click', loadProjectButtonClick);
                        projectListDiv.classList.remove('hidden');
                        return [2 /*return*/];
                }
            });
        });
    }
    router_1.default.append(new Route_1.default({
        path: '/',
        exec: function () {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    loadGistsButton.addEventListener('click', loadGistsButtonClick);
                    githubUsernameDiv.classList.remove('hidden');
                    return [2 /*return*/];
                });
            });
        }
    }));
    router_1.default.append(new Route_1.default({
        path: '/{id}',
        exec: function (request) {
            return __awaiter(this, void 0, void 0, function () {
                var id, gist;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            if (!!project_1.default.isLoaded()) return [3 /*break*/, 4];
                            id = request.params.id;
                            return [4 /*yield*/, gists_1.getById(id)];
                        case 1:
                            gist = _a.sent();
                            if (!gist) return [3 /*break*/, 3];
                            titleH2.textContent = gist.description;
                            return [4 /*yield*/, loadProject(gist.projectJson)];
                        case 2:
                            _a.sent();
                            return [3 /*break*/, 4];
                        case 3:
                            titleH2.textContent = '[Unfound Gist]';
                            _a.label = 4;
                        case 4: return [2 /*return*/];
                    }
                });
            });
        }
    }));
    router_1.default.start();
});
//# sourceMappingURL=gist.js.map