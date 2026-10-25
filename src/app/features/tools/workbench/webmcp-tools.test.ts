import { describe, expect, it } from 'vitest';
import { validateWebMcpInput } from '@app/features/tools/workbench/webmcp-tools';

describe('WebMCP tool input validation', () => {
	it('validates JSON Formatter text and options', () => {
		expect(validateWebMcpInput({ input: '{"x":1}', indent: '4' }, 'json-formatter')).toEqual({
			input: '{"x":1}',
			indent: '4',
		});
		expect(() => validateWebMcpInput({ input: '{}', indent: '8' }, 'json-formatter')).toThrow();
	});

	it('validates Base64 operation and limits', () => {
		expect(validateWebMcpInput({ input: 'hello', mode: 'decode' }, 'base64')).toEqual({
			input: 'hello',
			mode: 'decode',
		});
		expect(() => validateWebMcpInput({ input: 'x'.repeat(100_001) }, 'base64')).toThrow();
		expect(() => validateWebMcpInput({ input: 'hi', mode: 'other' }, 'base64')).toThrow();
	});

	it('validates UUID versions and bounded integer counts', () => {
		expect(validateWebMcpInput({ version: '7', count: 3 }, 'uuid')).toEqual({
			version: '7',
			count: '3',
		});
		for (const args of [{ count: 0 }, { count: 1001 }, { count: 1.5 }, { version: '1' }]) {
			expect(() => validateWebMcpInput(args, 'uuid')).toThrow();
		}
	});

	it('rejects non-object and unknown arguments', () => {
		expect(() => validateWebMcpInput([], 'json-formatter')).toThrow();
		expect(() => validateWebMcpInput({ input: '{}', download: true }, 'json-formatter')).toThrow();
		expect(() => validateWebMcpInput({ input: 'x' }, 'uuid')).toThrow();
	});
});
