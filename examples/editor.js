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
        define(["require", "exports", "../Editor", "../project", "../Runner"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var Editor_1 = require("../Editor");
    var project_1 = require("../project");
    var Runner_1 = require("../Runner");
    /* path to the project directory */
    var PROJECT_DIRECTORY = '../projects/';
    /* get references to key DOM nodes */
    var divFile = document.getElementById('div-file');
    var loadProjectButton = document.getElementById('load-project');
    var projectSelect = document.getElementById('project');
    var selectFile = document.getElementById('select-file');
    var runButton = document.getElementById('run');
    /* create an editor */
    var editorDiv = document.getElementById('editor');
    var editor = new Editor_1.default(editorDiv, {
        automaticLayout: true /* enables the editor to resize automagically */
    });
    /* create a runner */
    var runnerDiv = document.getElementById('runner');
    var runner = new Runner_1.default(runnerDiv);
    runner.on('error', function (evt) {
        console.error('Runner Error');
        console.error(evt.error);
    });
    /**
     * Listener that will be attached to the load project button click
     * @param e The mouse event
     */
    function loadProjectButtonClick(e) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        e.preventDefault();
                        return [4 /*yield*/, load(PROJECT_DIRECTORY + projectSelect.value)];
                    case 1:
                        _a.sent();
                        projectSelect.setAttribute('disabled', 'disabled');
                        loadProjectButton.setAttribute('disabled', 'disabled');
                        loadProjectButton.removeEventListener('click', loadProjectButtonClick);
                        return [2 /*return*/];
                }
            });
        });
    }
    function runButtonClick(e) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        e.preventDefault();
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
    /**
     * Listener that will be attached to the file select when there is a change which changes
     * the file that the editor is currently updating
     * @param e The event from the select change
     */
    function displayFileSelectChange(e) {
        e.preventDefault();
        editor.display(selectFile.value);
    }
    /**
     * Load the project bundle, setup the UI and display the initial file
     * @param filename The project bundle file to load
     */
    function load(filename) {
        return __awaiter(this, void 0, void 0, function () {
            var projectBundle;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        console.log('Loading project...');
                        return [4 /*yield*/, project_1.default.load(filename)];
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
                            selectFile.appendChild(option);
                        });
                        selectFile.addEventListener('change', displayFileSelectChange);
                        editor.display(selectFile.value);
                        divFile.classList.remove('hidden');
                        return [2 /*return*/];
                }
            });
        });
    }
    /* attach button listeners */
    loadProjectButton.addEventListener('click', loadProjectButtonClick);
    loadProjectButton.removeAttribute('disabled');
    projectSelect.removeAttribute('disabled');
    runButton.addEventListener('click', runButtonClick);
});
//# sourceMappingURL=editor.js.map