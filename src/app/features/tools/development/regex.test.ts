import { describe, expect, it } from 'vitest';
import { regexMatches } from '@app/features/tools/development/regex';

describe('regex matching', () => {
	it('returns captures, positions and multiple results', () =>
		expect(regexMatches('(a)(b)', 'g', 'ab ab')).toEqual([
			{ match: 'ab', index: 0, groups: ['a', 'b'] },
			{ match: 'ab', index: 3, groups: ['a', 'b'] },
		]));
	it('honors non-global mode', () => expect(regexMatches('a', '', 'aaa')).toHaveLength(1));
	it('supports zero-width and Unicode matches without looping', () => {
		expect(regexMatches('(?=a)', 'g', 'aa')).toHaveLength(2);
		expect(regexMatches('', 'gu', '😀')).toHaveLength(2);
	});
	it('returns no matches', () => expect(regexMatches('x', 'g', 'abc')).toEqual([]));
	it('rejects malformed patterns, flags and oversized input', () => {
		expect(regexMatches('a', 'g', 'a'.repeat(1000))).toHaveLength(1000);
		expect(() => regexMatches('(', 'g', '')).toThrow();
		expect(() => regexMatches('a', 'gg', '')).toThrow();
		expect(() => regexMatches('a', 'g', 'a'.repeat(100001))).toThrow();
		expect(() => regexMatches('a', 'g', 'a'.repeat(1001))).toThrow();
	});
});
