import { TranslatedToolError } from '@app/core/models/tool';

export const MAX_HAR_BYTES = 20 * 1024 * 1024;
export const MAX_HAR_ENTRIES = 50_000;

const REDACTED = '[REDACTED]';
const SENSITIVE_HEADERS = new Set(['authorization', 'proxy-authorization', 'cookie', 'set-cookie']);

export interface HarInspection {
	readonly sanitized: string;
	readonly summary: Readonly<{
		entries: number;
		domains: readonly string[];
		statuses: Readonly<Record<string, number>>;
		durationMs: number;
		transferBytes: number;
		sanitizedValues: number;
		requestMethods: readonly string[];
		sanitizedFields: readonly string[];
		sanitizationMethods: readonly string[];
	}>;
}

type JsonRecord = Record<string, unknown>;

function isRecord(value: unknown): value is JsonRecord {
	return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function recordAt(value: unknown, path: string): JsonRecord {
	if (!isRecord(value)) {
		throw new TranslatedToolError('tools.har.invalid_structure', { path }, 'files');
	}
	return value;
}

function parseHar(source: string): JsonRecord {
	let value: unknown;
	try {
		value = JSON.parse(source);
	} catch {
		throw new TranslatedToolError('tools.har.invalid_json', {}, 'files');
	}
	const har = recordAt(value, '');
	const log = recordAt(har['log'], 'log');
	if (log['version'] !== '1.2' || !isRecord(log['creator']) || !Array.isArray(log['entries'])) {
		throw new TranslatedToolError('tools.har.invalid_structure', { path: 'log' }, 'files');
	}
	if (log['entries'].length > MAX_HAR_ENTRIES) {
		throw new TranslatedToolError('tools.har.entry_limit', { limit: MAX_HAR_ENTRIES }, 'files');
	}
	return har;
}

function containsSensitiveName(name: string, customNames: ReadonlySet<string>): boolean {
	const normalized = name.trim().toLowerCase();
	return SENSITIVE_HEADERS.has(normalized) || customNames.has(normalized);
}

function sanitizeUrl(raw: string, counts: { value: number }): string {
	try {
		const url = new URL(raw);
		if (url.username || url.password) {
			url.username = REDACTED;
			url.password = REDACTED;
			counts.value++;
		}
		for (const key of new Set(url.searchParams.keys())) {
			const values = url.searchParams.getAll(key);
			url.searchParams.delete(key);
			for (const value of values) {
				url.searchParams.append(key, REDACTED);
				if (value) {
					counts.value++;
				}
			}
		}
		if (url.hash) {
			url.hash = '#[REDACTED]';
			counts.value++;
		}
		return url.toString();
	} catch {
		throw new TranslatedToolError('tools.har.invalid_url', {}, 'files');
	}
}

function sanitizePairs(
	value: unknown,
	customNames: ReadonlySet<string>,
	counts: { value: number },
): void {
	if (!Array.isArray(value)) {
		return;
	}
	for (const item of value) {
		if (!isRecord(item)) {
			continue;
		}
		const name = typeof item['name'] === 'string' ? item['name'] : '';
		if (Object.hasOwn(item, 'value') && (name || item['value'])) {
			item['value'] = REDACTED;
			counts.value++;
		}
		if (typeof item['fileName'] === 'string' && item['fileName']) {
			item['fileName'] = REDACTED;
			counts.value++;
		}
		if (containsSensitiveName(name, customNames)) {
			for (const key of ['fileName', 'contentType', 'value']) {
				if (typeof item[key] === 'string' && item[key]) {
					item[key] = REDACTED;
					counts.value++;
				}
			}
		}
	}
}

function sanitizeHeaders(
	value: unknown,
	customNames: ReadonlySet<string>,
	counts: { value: number },
): void {
	if (!Array.isArray(value)) {
		return;
	}
	for (const item of value) {
		if (!isRecord(item)) {
			continue;
		}
		const name = typeof item['name'] === 'string' ? item['name'] : '';
		if (
			containsSensitiveName(name, customNames) &&
			typeof item['value'] === 'string' &&
			item['value']
		) {
			item['value'] = REDACTED;
			counts.value++;
		}
	}
}

function sanitizeCookies(value: unknown, counts: { value: number }): void {
	if (!Array.isArray(value)) {
		return;
	}
	for (const cookie of value) {
		if (!isRecord(cookie)) {
			continue;
		}
		if (typeof cookie['value'] === 'string' && cookie['value']) {
			cookie['value'] = REDACTED;
			counts.value++;
		}
	}
}

function redactJsonValues(value: unknown, counts: { value: number }): unknown {
	if (Array.isArray(value)) {
		return value.map((item) => redactJsonValues(item, counts));
	}
	if (isRecord(value)) {
		return Object.fromEntries(
			Object.entries(value).map(([key, item]) => {
				if (item === null || item === undefined || item === '') {
					return [key, item];
				}
				counts.value++;
				return [key, REDACTED];
			}),
		);
	}
	if (value !== null && value !== undefined && value !== '') {
		counts.value++;
		return REDACTED;
	}
	return value;
}

function sanitizeBody(container: JsonRecord, key: string, counts: { value: number }): void {
	if (typeof container[key] !== 'string' || !container[key]) {
		return;
	}
	const raw = container[key] as string;
	const encoding =
		typeof container['encoding'] === 'string' ? container['encoding'].toLowerCase() : '';
	const mimeType =
		typeof container['mimeType'] === 'string' ? container['mimeType'].toLowerCase() : '';
	if (encoding === 'base64') {
		container[key] = REDACTED;
		counts.value++;
		return;
	}
	if (mimeType.includes('json') || ['{', '['].some((start) => raw.trimStart().startsWith(start))) {
		try {
			container[key] = JSON.stringify(redactJsonValues(JSON.parse(raw) as unknown, counts));
			return;
		} catch {
			// Malformed or non-JSON bodies are omitted as a whole below.
		}
	}
	container[key] = REDACTED;
	counts.value++;
}

function sanitizeEntry(
	entryValue: unknown,
	customNames: ReadonlySet<string>,
	counts: { value: number },
): JsonRecord {
	const entry = recordAt(entryValue, 'log.entries[]');
	const request = recordAt(entry['request'], 'log.entries[].request');
	const response = recordAt(entry['response'], 'log.entries[].response');
	if (typeof request['url'] !== 'string' || typeof request['method'] !== 'string') {
		throw new TranslatedToolError(
			'tools.har.invalid_structure',
			{ path: 'log.entries[].request' },
			'files',
		);
	}
	request['url'] = sanitizeUrl(request['url'], counts);
	sanitizePairs(request['queryString'], customNames, counts);
	sanitizeHeaders(request['headers'], customNames, counts);
	sanitizeCookies(request['cookies'], counts);
	if (isRecord(request['postData'])) {
		const postData = request['postData'];
		sanitizePairs(postData['params'], customNames, counts);
		sanitizeBody(postData, 'text', counts);
	}
	sanitizeHeaders(response['headers'], customNames, counts);
	sanitizeCookies(response['cookies'], counts);
	if (isRecord(response['content'])) {
		sanitizeBody(response['content'], 'text', counts);
	}
	return entry;
}

export async function inspectHar(file: File, additionalNames: string): Promise<HarInspection> {
	if (file.size === 0 || file.size > MAX_HAR_BYTES) {
		throw new TranslatedToolError('tools.har.file_limit', { limit: '20 MB' }, 'files');
	}
	const customNames = new Set(
		additionalNames
			.split(/[\n,;]/u)
			.map((name) => name.trim().toLowerCase())
			.filter(Boolean),
	);
	const har = parseHar(await file.text());
	const log = recordAt(har['log'], 'log');
	const entries = log['entries'] as unknown[];
	const counts = { value: 0 };
	const sanitizedEntries = entries.map((entry) => sanitizeEntry(entry, customNames, counts));
	const statuses: Record<string, number> = {};
	const domains = new Set<string>();
	const methods = new Set<string>();
	let durationMs = 0;
	let transferBytes = 0;
	for (const entry of sanitizedEntries) {
		const request = entry['request'] as JsonRecord;
		const response = entry['response'] as JsonRecord;
		const url = new URL(request['url'] as string);
		domains.add(url.hostname);
		methods.add((request['method'] as string).toUpperCase());
		const status = typeof response['status'] === 'number' ? String(response['status']) : 'unknown';
		statuses[status] = (statuses[status] ?? 0) + 1;
		if (typeof entry['time'] === 'number' && Number.isFinite(entry['time'])) {
			durationMs += Math.max(0, entry['time']);
		}
		if (isRecord(response['content']) && typeof response['content']['size'] === 'number') {
			transferBytes += Math.max(0, response['content']['size']);
		}
	}
	const sanitizedHar: JsonRecord = { ...har, log: { ...log, entries: sanitizedEntries } };
	return {
		sanitized: JSON.stringify(sanitizedHar, null, 2),
		summary: {
			entries: sanitizedEntries.length,
			domains: [...domains].sort(),
			statuses,
			durationMs,
			transferBytes,
			sanitizedValues: counts.value,
			requestMethods: [...methods].sort(),
			sanitizedFields: [
				'Authorization',
				'Proxy-Authorization',
				'Cookie',
				'Set-Cookie',
				'request.cookies[].value',
				'response.cookies[].value',
				'request.queryString[].value',
				'request.postData.params[].value',
				'request.postData.text',
				'response.content.text',
				...(customNames.size ? ['additional configured field names'] : []),
			],
			sanitizationMethods: [
				'authorization headers',
				'proxy authorization headers',
				'cookie and set-cookie headers',
				'structured cookie values',
				'URL query values and fragments',
				'form field values',
				'JSON body values',
				'opaque and Base64 bodies',
				...(customNames.size ? ['custom sensitive field names'] : []),
			],
		},
	};
}
