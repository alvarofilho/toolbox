import { describe, expect, it } from 'vitest';
import { randomInt, randomString, password, uuid } from '@app/features/tools/_shared/random';

describe('secure generation', () => {
	it('generates UUID v4 and v7 with version and variant bits', () => {
		for (const version of ['4', '7']) {
			const ids = Array.from({ length: 100 }, () => uuid(version));
			expect(new Set(ids).size).toBe(100);
			for (const id of ids) {
				expect(id).toMatch(
					new RegExp(
						`^[a-f0-9]{8}-[a-f0-9]{4}-${version}[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$`,
					),
				);
			}
		}
	});
	it('encodes current time in UUID v7', () => {
		const before = Date.now();
		const encoded = parseInt(uuid('7').replace(/-/g, '').slice(0, 12), 16);
		expect(encoded).toBeGreaterThanOrEqual(before);
		expect(encoded).toBeLessThanOrEqual(Date.now());
	});
	it('guarantees all selected password character sets', () => {
		for (let i = 0; i < 50; i++) {
			const result = password(24, ['ABC', 'abc', '123', '!@#']);
			expect(result).toHaveLength(24);
			for (const chars of ['ABC', 'abc', '123', '!@#']) {
				expect(Array.from(result).some((c) => chars.includes(c))).toBe(true);
			}
		}
	});
	it('supports one character set', () => expect(password(8, ['a'])).toBe('aaaaaaaa'));
	it('rejects invalid generation parameters', () => {
		expect(() => randomInt(0)).toThrow();
		expect(() => randomString(4, '')).toThrow();
		expect(() => password(7, ['a'])).toThrow();
		expect(() => password(8, [])).toThrow();
		expect(() => uuid('1')).toThrow();
	});
});
