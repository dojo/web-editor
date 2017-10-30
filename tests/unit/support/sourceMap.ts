const { registerSuite } = intern.getInterface('object');
const { assert } = intern.getPlugin('chai');
import { wrapCode } from '../../../src/support/sourceMap';
import * as sourceMap from 'source-map';

const SOURCE_MAP_REGEX = /(?:\/{2}[#@]{1,2}|\/\*)\s+sourceMappingURL\s*=\s*(data:(?:[^;]+;)+base64,)?(\S+)(?:\n\s*)?$/;

const code = `(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "./Editor", "./project", "./Runner"], factory);
    }
})(function (require, exports) {
    "use strict";
    var Editor_1 = require("./Editor");
    var project_1 = require("./project");
    var Runner_1 = require("./Runner");
    return {
        Editor: Editor_1.default,
        project: project_1.default,
        Runner: Runner_1.default
    };
});
//# sourceMappingURL=main.js.map`;

const map = `{"version":3,"file":"main.js","sourceRoot":"","sources":["../../src/main.ts"],"names":[],"mappings":";;;;;;;;;;IAAA,mCAA8B;IAC9B,qCAAgC;IAChC,mCAA8B;IAE9B,OAAS;QACR,MAAM,kBAAA;QACN,OAAO,mBAAA;QACP,MAAM,kBAAA;KACN,CAAC","sourcesContent":["import Editor from './Editor';\\nimport project from './project';\\nimport Runner from './Runner';\\n\\nexport = {\\n\\tEditor,\\n\\tproject,\\n\\tRunner\\n};\\n"]}`;

const smc = new sourceMap.SourceMapConsumer(map);

registerSuite('support/sourceMap', {

	'wrapCode()': {
		'module with sourcemap'() {
			const originalPosition = smc.originalPositionFor({
				line: 14,
				column: 5
			});
			const actual = wrapCode(`/* a\nmulti-line\ncomment */\n`, {
				code,
				map
			}, `/* some\nsort of\ncomment postscript */`);
			const actualSmc = new sourceMap.SourceMapConsumer(actual.map.toJSON());
			assert.deepEqual(actualSmc.originalPositionFor({
				line: 17,
				column: 5
			}), originalPosition, 'actual sourcemap should have added expected lines');
			assert.isFalse(SOURCE_MAP_REGEX.test(actual.code), 'code should not have any sourceMappingURL');
		},

		'code without a sourcemap'() {
			const actual = wrapCode(`/* a\nmulti-line\ncomment */\n`, {
				code
			}, `/* some\nsort of\ncomment postscript */`);
			assert.deepEqual(<any> actual.map.toJSON(), { version: 3, sources: [], names: [], mappings: '' }, 'should return an empty source map');
		}
	}
});
