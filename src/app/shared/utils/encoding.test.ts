import { describe, expect, it } from 'vitest';
import {
	base64Encode,
	base64Decode,
	convertCase,
	decodeJwt,
	timestamp,
} from '@app/shared/utils/encoding';

describe('encoding', () => {
	it.each(['Olá 🌎!', 'foo', '', '漢字\n\0'])('round-trips Unicode %s', (text) =>
		expect(base64Decode(base64Encode(text))).toBe(text),
	);
	it.each(['%%%', 'a', 'a===', '////'])('rejects malformed Base64 %s', (text) =>
		expect(() => base64Decode(text)).toThrow(),
	);
	it('accepts unpadded Base64', () => expect(base64Decode('Zm8')).toBe('fo'));
	it('decodes JWT without claiming signature validity', () => {
		const part = (obj: unknown) =>
			base64Encode(JSON.stringify(obj)).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
		const result = JSON.parse(
			decodeJwt(`${part({ alg: 'HS256' })}.${part({ name: 'João', exp: 0 })}.c2ln`),
		);
		expect(result.payload.name).toBe('João');
		expect(result.signatureVerified).toBe(false);
		expect(result.dates.expiration).toBe('expired');
	});
	it.each(['abc', 'a.b.c', 'e30.W10.c2ln', 'e30.e30.!'])('rejects malformed JWT %s', (token) =>
		expect(() => decodeJwt(token)).toThrow(),
	);
	it.each([
		['0', 'seconds'],
		['0', 'milliseconds'],
		['1970-01-01T00:00:00Z', 'iso'],
		['1970-01-01T03:00:00+03:00', 'iso'],
	])('converts epoch %s', (value, mode) =>
		expect(JSON.parse(timestamp(value, mode)).utc).toBe('1970-01-01T00:00:00.000Z'),
	);
	it('handles negative seconds and millisecond precision', () => {
		expect(JSON.parse(timestamp('-1', 'seconds')).utc).toBe('1969-12-31T23:59:59.000Z');
		expect(JSON.parse(timestamp('1001', 'milliseconds')).milliseconds).toBe(1001);
	});
	it.each([
		['', 'seconds'],
		['NaN', 'seconds'],
		['1e100', 'seconds'],
		['2026-02-30T00:00:00Z', 'iso'],
		['2026-01-01', 'iso'],
		['2026-13-01T00:00:00Z', 'iso'],
		['2026-01-01T24:00:00Z', 'iso'],
		['8640000000000001', 'milliseconds'],
	])('rejects invalid date %s', (value, mode) => expect(() => timestamp(value, mode)).toThrow());
	it.each([
		['camel', 'helloWorld'],
		['pascal', 'HelloWorld'],
		['snake', 'hello_world'],
		['kebab', 'hello-world'],
		['upper', 'HELLO WORLD'],
		['lower', 'hello world'],
	])('converts %s', (mode, expected) => expect(convertCase('Hello World', mode)).toBe(expected));
	it('normalizes accents and acronym boundaries', () => {
		expect(convertCase('HTTPResponse São Paulo', 'snake')).toBe('http_response_sao_paulo');
		expect(convertCase('', 'camel')).toBe('');
	});
});
