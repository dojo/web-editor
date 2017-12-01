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
        define(["require", "exports", "@dojo/widget-core/d", "@dojo/widget-core/mixins/Projector", "@dojo/widget-core/WidgetBase", "../LiveCodeController", "../LiveCodeExample", "../project", "../support/editorThemes"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var d_1 = require("@dojo/widget-core/d");
    var Projector_1 = require("@dojo/widget-core/mixins/Projector");
    var WidgetBase_1 = require("@dojo/widget-core/WidgetBase");
    var LiveCodeController_1 = require("../LiveCodeController");
    var LiveCodeExample_1 = require("../LiveCodeExample");
    var project_1 = require("../project");
    var editorThemes_1 = require("../support/editorThemes");
    var EDITOR_THEME = '../../data/editor-dark.json';
    var PROJECT_JSON = '../../../projects/live-editor.project.json';
    var GREEKING = "Quidne tamen pulvinar ratis verto antehabeo quidne. Haero letatio semper ex zelus autem etiam. Utrum sino ratis validus nec. Sino delenit pecus vulpes autem ventosus. Saepius roto vindico himenaeos utinam sed mus probo. Pulvinar sed nam vestibulum curabitur gravida. Condimentum reprobo gravis semper morbi letalis tum scelerisque torquent. Platea ne sudo praesent leo secundum.";
    var text = "import WidgetBase from '@dojo/widget-core/WidgetBase';\nimport ProjectorMixin from '@dojo/widget-core/mixins/Projector';\nimport { v } from '@dojo/widget-core/d';\n\nclass HelloWorld extends WidgetBase {\n\trender() {\n\t\treturn v('div', {}, [ 'Hello world!' ]);\n\t}\n}\n\nconst projector = new (ProjectorMixin(HelloWorld))();\nprojector.append();\n";
    var text1 = "import WidgetBase from '@dojo/widget-core/WidgetBase';\nimport ProjectorMixin from '@dojo/widget-core/mixins/Projector';\nimport { tsx } from '@dojo/widget-core/tsx';\n\nclass HelloWorld extends WidgetBase {\n\trender() {\n\t\treturn (\n\t\t\t<div>\n\t\t\t\tHello world!\n\t\t\t</div>\n\t\t);\n\t}\n}\n\nconst projector = new (ProjectorMixin(HelloWorld))();\nprojector.append();\n";
    var App = /** @class */ (function (_super) {
        __extends(App, _super);
        function App() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        App.prototype.render = function () {
            return d_1.w(LiveCodeController_1.default, {
                project: project_1.default,
                runnerSrc: './loading.html'
            }, [
                d_1.w(LiveCodeExample_1.default, {
                    id: 'example_001',
                    description: GREEKING,
                    key: 'example_001',
                    title: 'Example 1'
                }, [text]),
                d_1.w(LiveCodeExample_1.default, {
                    id: 'example_002',
                    description: GREEKING,
                    key: 'example_002',
                    title: 'Example 2',
                    tsx: true
                }, [text1])
            ]);
        };
        return App;
    }(WidgetBase_1.default));
    var projector = new (Projector_1.default(App))();
    (function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, editorThemes_1.load(EDITOR_THEME)];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, project_1.default.load(PROJECT_JSON)];
                    case 2:
                        _a.sent();
                        projector.append();
                        return [2 /*return*/];
                }
            });
        });
    })();
});
//# sourceMappingURL=live.js.map