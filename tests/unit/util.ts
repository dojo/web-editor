const { registerSuite } = intern.getInterface('object');
const { assert } = intern.getPlugin('chai');
import { stringify } from '../../src/util';

registerSuite('util', {
	'stringify': (() => {
		return {
			'null and undefined'() {
				assert.strictEqual(stringify(null), 'null');
				assert.strictEqual(stringify(''), '');
				assert.strictEqual(stringify(undefined), 'undefined');
			},
			'primitives'() {
				assert.strictEqual(stringify('test'), 'test');
				assert.strictEqual(stringify(9), '9');
				assert.strictEqual(stringify(false), 'false');
			},
			'date'() {
				const date = new Date();
				const expected = date.toString();
				const actual = stringify(date);
				assert.strictEqual(actual, expected);
			},
			'array'() {
				const expected = '[1, 2, true, "hi", 3]';
				const actual = stringify([1, 2, true, 'hi', 3]);
				assert.strictEqual(actual, expected);
			},
			'recursive array'() {
				const expected = '[1, 2, true, "hi", 3, Array[6]]';
				const arr: any[] = [1, 2, true, 'hi', 3];
				arr.push(arr);
				assert.strictEqual(stringify(arr), expected);
			},
			'object'() {
				const expected = '{a: true, b: "test", c: 9}';
				const actual = stringify({a: true, b: 'test', c: 9});
				assert.strictEqual(actual, expected);
			},
			'recursive object'() {
				const o: any = {a: true, b: false };
				o.recursive = o;
				const expected = '{a: true, b: false, recursive: Object}';
				assert.strictEqual(stringify(o), expected);
			}
		};
	})()
});
