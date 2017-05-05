import { CodeWithSourceMap, SourceMapConsumer, SourceNode } from 'source-map';

const SOURCE_MAP_REGEX = /(?:\/{2}[#@]{1,2}|\/\*)\s+sourceMappingURL\s*=\s*(data:(?:[^;]+;)+base64,)?(\S+)(?:\n\s*)?$/;

/**
 * Wrap code, which has a source map, with a preamble and a postscript and return the wrapped code with an updated
 * map.
 * @param preamble A string to append before the code
 * @param code The code, with an optional source map in string format
 * @param postscript A string to append after the code
 */
export function wrapCode(preamble: string, code: { map?: string, code: string }, postscript: string): CodeWithSourceMap  {
	const result = new SourceNode();
	result.add(preamble);
	if (code.map) {
		result.add(SourceNode.fromStringWithSourceMap(code.code.replace(SOURCE_MAP_REGEX, ''), new SourceMapConsumer(code.map)));
	}
	else {
		result.add(code.code);
	}
	result.add(postscript);
	return result.toStringWithSourceMap();
}
