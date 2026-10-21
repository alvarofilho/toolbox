import { describe, expect, it } from 'vitest';
import { TranslatedToolError } from '@app/core/models/tool';
import { inspectHar, MAX_HAR_ENTRIES } from '@app/features/tools/development/har';
import { definition } from '@app/features/tools/development/har.tool';

function makeHar(entry: Record<string, unknown>): string {
	return JSON.stringify({
		log: {
			version: '1.2',
			creator: { name: 'test', version: '1' },
			entries: [entry],
		},
	});
}

function makeEntry(overrides: Record<string, unknown> = {}): Record<string, unknown> {
	return {
		time: 12,
		request: {
			method: 'POST',
			url: 'https://user:pass@example.test/ação?token=a%20b&token=第二#private',
			headers: [
				{ name: 'aUtHoRiZaTiOn', value: 'Bearer secret' },
				{ name: 'X-Private', value: 'custom secret' },
			],
			cookies: [{ name: 'session', value: 'cookie secret', path: '/' }],
			queryString: [
				{ name: 'token', value: 'secret' },
				{ name: 'token', value: 'two' },
			],
			postData: {
				mimeType: 'application/json',
				text: JSON.stringify({ email: 'pessoa@example.com', nested: { account: 123 }, empty: '' }),
			},
		},
		response: {
			status: 200,
			headers: [{ name: 'SET-cookie', value: 'sid=secret' }],
			cookies: [{ name: 'sid', value: 'response cookie' }],
			content: { size: 42, mimeType: 'application/json', text: '{"result":"private"}' },
		},
		...overrides,
	};
}

function asFile(value: string): File {
	return new File([value], 'capture.har', { type: 'application/json' });
}

describe('HAR inspection and sanitization', () => {
	it('redacts case-insensitive headers, repeated URL/query values, cookies, JSON, and custom fields', async () => {
		const source = makeHar(makeEntry());
		const result = await inspectHar(asFile(source), 'x-private, account');
		const sanitized = JSON.parse(result.sanitized) as Record<string, unknown>;
		const log = sanitized['log'] as Record<string, unknown>;
		const entries = log['entries'] as Record<string, unknown>[];
		const entry = entries[0];
		const request = entry['request'] as Record<string, unknown>;
		const requestHeaders = request['headers'] as Record<string, unknown>[];
		const requestUrl = new URL(request['url'] as string);
		expect(requestUrl.username).toBe('%5BREDACTED%5D');
		expect(requestUrl.password).toBe('%5BREDACTED%5D');
		expect(requestUrl.searchParams.getAll('token')).toEqual(['[REDACTED]', '[REDACTED]']);
		expect(requestUrl.hash).toBe('#[REDACTED]');
		expect(requestHeaders.map((header) => header['value'])).toEqual(['[REDACTED]', '[REDACTED]']);
		expect(JSON.stringify(result)).not.toContain('secret');
		expect(JSON.stringify(result)).not.toContain('pessoa@example.com');
		expect(result.summary.sanitizedValues).toBeGreaterThan(0);
		expect(result.summary.sanitizationMethods).toContain('custom sensitive field names');
		expect(result.summary.domains).toEqual(['example.test']);
		expect(result.summary.statuses).toEqual({ '200': 1 });
		expect(result.summary.durationMs).toBe(12);
		expect(result.summary.transferBytes).toBe(42);
	});

	it('redacts structured form fields, Base64 and opaque binary payloads while preserving Unicode HAR text', async () => {
		const entry = makeEntry();
		const request = entry['request'] as Record<string, unknown>;
		request['url'] = 'https://example.test/ação?q=olá';
		request['postData'] = {
			mimeType: 'application/x-www-form-urlencoded',
			params: [
				{ name: 'email', value: 'pessoa@example.com' },
				{ name: 'email', value: 'outro' },
			],
		};
		const response = entry['response'] as Record<string, unknown>;
		response['content'] = {
			size: 2,
			mimeType: 'application/octet-stream',
			encoding: 'base64',
			text: 'c2VjcmV0',
		};
		const result = await inspectHar(asFile(makeHar(entry)), '');
		expect(decodeURIComponent(result.sanitized)).toContain('/ação');
		expect(result.sanitized).toContain('[REDACTED]');
		expect(result.sanitized).not.toContain('pessoa@example.com');
		expect(result.sanitized).not.toContain('c2VjcmV0');
	});

	it('previews only sanitized HAR data and provides a valid sanitized download artifact', async () => {
		const input = makeHar(makeEntry());
		const result = await definition.run({ sensitiveNames: '' }, { files: [asFile(input)] });
		const downloaded = await result.artifacts?.[0]?.blob.text();
		expect(result.preview).not.toContain('Bearer secret');
		expect(result.preview).toContain('[REDACTED]');
		expect(downloaded).toBeDefined();
		expect(JSON.parse(downloaded ?? '')).toMatchObject({ log: { version: '1.2' } });
		expect(downloaded).not.toContain('pessoa@example.com');
	});

	it('rejects malformed JSON, invalid HAR structure, oversized files, and excessive entries', async () => {
		await expect(inspectHar(asFile('{'), '')).rejects.toMatchObject({
			translationKey: 'tools.har.invalid_json',
		});
		await expect(inspectHar(asFile('{"log":{}}'), '')).rejects.toMatchObject({
			translationKey: 'tools.har.invalid_structure',
		});
		await expect(
			inspectHar(new File(['x'.repeat(21 * 1024 * 1024)], 'large.har'), ''),
		).rejects.toBeInstanceOf(TranslatedToolError);
		const tooMany = JSON.stringify({
			log: {
				version: '1.2',
				creator: {},
				entries: Array.from({ length: MAX_HAR_ENTRIES + 1 }, () => ({})),
			},
		});
		await expect(inspectHar(asFile(tooMany), '')).rejects.toMatchObject({
			translationKey: 'tools.har.entry_limit',
		});
	});
});
