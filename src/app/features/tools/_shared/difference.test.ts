import { describe, expect, it } from 'vitest';
import { canonicalJson, lineDiff } from '@app/features/tools/_shared/difference';

describe('diff', () => {
	it('ignores JSON object key order recursively but preserves array order', () => {
		expect(canonicalJson({ b: 2, a: { d: 4, c: 3 } })).toEqual({ a: { c: 3, d: 4 }, b: 2 });
		expect(canonicalJson([2, 1])).toEqual([2, 1]);
	});
	it('reports added and removed lines', () => {
		const result = lineDiff('one\ntwo\n', 'one\nthree\n');
		expect(result).toContain('- two');
		expect(result).toContain('+ three');
	});
	it('preserves newline changes', () => expect(lineDiff('a', 'a\n')).toContain('+ a'));
	it('handles equal and empty inputs', () => {
		expect(lineDiff('', '')).toContain('No differences');
		expect(lineDiff('', 'new')).toContain('+ new');
	});
});
