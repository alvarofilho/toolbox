import { field } from '@app/core/models/tool';
import { input, select } from '@app/features/tools/_shared/controls';
import { tool } from '@app/features/tools/_shared/definition';
import { escapeHtml, preview } from '@app/features/tools/_shared/preview';

const RECORD_TYPES = {
	A: 1,
	AAAA: 28,
	CNAME: 5,
	MX: 15,
	TXT: 16,
	NS: 2,
	SOA: 6,
	SRV: 33,
	CAA: 257,
} as const;

type RecordType = keyof typeof RECORD_TYPES;
type QueryType = RecordType | 'ALL';
type ResolverName = 'Cloudflare' | 'Google';
const RECORD_TYPE_LIST: readonly RecordType[] = [
	'A',
	'AAAA',
	'CNAME',
	'MX',
	'TXT',
	'NS',
	'SOA',
	'SRV',
	'CAA',
];

function isRecordType(value: string): value is RecordType {
	return Object.hasOwn(RECORD_TYPES, value);
}

function isQueryType(value: string): value is QueryType {
	return value === 'ALL' || isRecordType(value);
}

interface DnsAnswer {
	readonly name: string;
	readonly type: number;
	readonly TTL: number;
	readonly data: string;
}

interface DnsResponse {
	readonly Status: number;
	readonly Answer?: readonly DnsAnswer[];
}

type ResolverRecordResult =
	| { readonly type: RecordType; readonly response: DnsResponse }
	| { readonly type: RecordType; readonly error: string };

interface ResolverResult {
	readonly name: ResolverName;
	readonly records: readonly ResolverRecordResult[];
}

function isDnsAnswer(value: unknown): value is DnsAnswer {
	return (
		isRecord(value) &&
		typeof value['name'] === 'string' &&
		typeof value['type'] === 'number' &&
		typeof value['TTL'] === 'number' &&
		typeof value['data'] === 'string'
	);
}

const RESOLVERS: readonly {
	readonly name: ResolverName;
	readonly endpoint: string;
}[] = [
	{ name: 'Cloudflare', endpoint: 'https://cloudflare-dns.com/dns-query' },
	{ name: 'Google', endpoint: 'https://dns.google/resolve' },
];

function normalizeDomain(value: string): string {
	const trimmed = value.trim();
	if (!trimmed) {
		throw new Error('Enter a domain name.');
	}

	let hostname: string;
	try {
		hostname = new URL(trimmed.includes('://') ? trimmed : `https://${trimmed}`).hostname;
	} catch {
		throw new Error('Enter a valid domain name, such as example.com.');
	}

	const domain = hostname.toLowerCase().replace(/\.$/, '');
	if (
		domain.length > 253 ||
		!domain.includes('.') ||
		domain.split('.').some((label) => !/^(?!-)[a-z\d-]{1,63}(?<!-)$/.test(label))
	) {
		throw new Error('Enter a valid domain name, such as example.com.');
	}
	return domain;
}

function isRecord(value: unknown): value is Record<string, unknown> {
	return typeof value === 'object' && value !== null;
}

function parseResponse(value: unknown): DnsResponse {
	if (!isRecord(value) || typeof value['Status'] !== 'number') {
		throw new Error('The resolver returned an invalid response.');
	}
	const answers = value['Answer'];
	if (answers !== undefined && (!Array.isArray(answers) || !answers.every(isDnsAnswer))) {
		throw new Error('The resolver returned an invalid answer.');
	}
	return {
		Status: value['Status'],
		...(Array.isArray(answers) ? { Answer: answers.filter(isDnsAnswer) } : {}),
	};
}

async function queryResolver(
	endpoint: string,
	domain: string,
	type: RecordType,
): Promise<DnsResponse> {
	const url = new URL(endpoint);
	url.searchParams.set('name', domain);
	url.searchParams.set('type', type);
	const response = await fetch(url, {
		headers: { accept: 'application/dns-json' },
		signal: AbortSignal.timeout(10_000),
	});
	if (!response.ok) {
		throw new Error(`HTTP ${response.status}`);
	}
	return parseResponse(await response.json());
}

function statusLabel(status: number): string {
	return (
		{
			0: 'NOERROR',
			1: 'FORMERR',
			2: 'SERVFAIL',
			3: 'NXDOMAIN',
			4: 'NOTIMP',
			5: 'REFUSED',
		}[status] ?? `DNS status ${status}`
	);
}

function txtNote(domain: string, data: string): string {
	const value = data.replace(/^"|"$/g, '');
	if (value.toLowerCase().startsWith('v=spf1')) {
		return '  SPF policy (controls which servers may send mail for this domain).';
	}
	if (domain.startsWith('_dmarc.') && value.toLowerCase().startsWith('v=dmarc1')) {
		return '  DMARC policy (tells receivers how to handle unauthenticated mail).';
	}
	if (domain.includes('._domainkey.') && value.toLowerCase().startsWith('v=dkim1')) {
		return '  DKIM public key (used to verify signed email).';
	}
	return '';
}

function answerLine(domain: string, type: RecordType, answer: DnsAnswer): string {
	const rawValue = type === 'TXT' ? answer.data.replace(/^"|"$/g, '') : answer.data;
	const value = type === 'TXT' ? `${rawValue}${txtNote(domain, answer.data)}` : rawValue;
	return `  ${value}  (TTL ${answer.TTL}s)`;
}

function compareAnswers(
	responses: ReadonlyMap<ResolverName, DnsResponse>,
	type: RecordType,
): string {
	const values = [...responses.values()].map((response) =>
		(response.Answer ?? [])
			.filter((answer) => answer.type === RECORD_TYPES[type])
			.map((answer) =>
				(type === 'TXT' ? answer.data.replace(/^"|"$/g, '') : answer.data).trim().toLowerCase(),
			)
			.sort()
			.join('\n'),
	);
	return values.length === 2 && values[0] !== values[1]
		? '  ⚠ Resolvers returned different records.'
		: '';
}

function hasDifferentAnswers(
	cloudflare: ResolverRecordResult | undefined,
	google: ResolverRecordResult | undefined,
	type: RecordType,
): boolean {
	if (!cloudflare || !google || 'error' in cloudflare || 'error' in google) {
		return true;
	}
	if (cloudflare.response.Status !== google.response.Status) {
		return true;
	}
	const responses = new Map<ResolverName, DnsResponse>([
		['Cloudflare', cloudflare.response],
		['Google', google.response],
	]);
	return compareAnswers(responses, type) !== '';
}

function recordCell(
	domain: string,
	type: RecordType,
	resolver: ResolverName,
	result: ResolverRecordResult | undefined,
): string {
	if (!result) {
		return `<td data-resolver="${resolver}"><span class="dns-failure">NO RESPONSE</span></td>`;
	}
	if ('error' in result) {
		return `<td data-resolver="${resolver}"><span class="dns-failure">QUERY FAILED</span><code>${escapeHtml(result.error)}</code></td>`;
	}
	const { response } = result;
	const answers = (response.Answer ?? []).filter((answer) => answer.type === RECORD_TYPES[type]);
	const statusClass = response.Status === 0 ? 'dns-ok' : 'dns-status-error';
	const status = `<span class="dns-status ${statusClass}">${statusLabel(response.Status)}</span>`;
	if (!answers.length) {
		const message = response.Status === 3 ? 'Domain does not exist' : 'No records';
		return `<td data-resolver="${resolver}">${status}<span class="dns-empty">${message}</span></td>`;
	}
	const values = answers
		.map((answer) => {
			const value = type === 'TXT' ? answer.data.replace(/^"|"$/g, '') : answer.data;
			const note = type === 'TXT' ? txtNote(domain, answer.data).trim() : '';
			return `<div class="dns-answer"><code>${escapeHtml(value)}</code><small class="dns-ttl">TTL ${answer.TTL}s</small>${note ? `<small class="dns-note">${escapeHtml(note)}</small>` : ''}</div>`;
		})
		.join('');
	return `<td data-resolver="${resolver}">${status}<div class="dns-values">${values}</div></td>`;
}

function renderPreview(
	domain: string,
	typeInput: QueryType,
	types: readonly RecordType[],
	resolvers: readonly ResolverResult[],
): string {
	const cloudflare = resolvers.find((resolver) => resolver.name === 'Cloudflare');
	const google = resolvers.find((resolver) => resolver.name === 'Google');
	const rows = types
		.map((type) => {
			const cloudflareRecord = cloudflare?.records.find((record) => record.type === type);
			const googleRecord = google?.records.find((record) => record.type === type);
			const different = hasDifferentAnswers(cloudflareRecord, googleRecord, type);
			const marker = different
				? '<span class="dns-difference" aria-label="Resolver responses differ">≠</span>'
				: '';
			return `<tr${different ? ' class="dns-row-different"' : ''}><th scope="row"><code>${type}</code>${marker}</th>${recordCell(domain, type, 'Cloudflare', cloudflareRecord)}${recordCell(domain, type, 'Google', googleRecord)}</tr>`;
		})
		.join('');
	const scope = typeInput === 'ALL' ? `${types.length} TYPES` : typeInput;
	const body = `<main class="dns-report"><header class="dns-heading"><div><p class="dns-eyebrow">DNS RESPONSE</p><h3>${escapeHtml(domain)}</h3></div><span class="dns-scope">${scope}</span></header><div class="dns-table-scroll"><table><caption class="sr-only">DNS records for ${escapeHtml(domain)} compared across Cloudflare and Google resolvers</caption><thead><tr><th scope="col">TYPE</th><th scope="col">CLOUDFLARE</th><th scope="col">GOOGLE</th></tr></thead><tbody>${rows}</tbody></table></div><footer class="dns-foot"><span><i class="dns-legend-match" aria-hidden="true"></i>Responses match</span><span><i class="dns-legend-diff" aria-hidden="true">≠</i>Responses differ</span></footer></main>`;
	const css = `body{padding:12px;font-family:'IBM Plex Sans Variable','IBM Plex Sans',system-ui,sans-serif;font-size:13px}.dns-report{--dns-line:#dce3db;--dns-accent:#285d45;--dns-alert:#a86a17;--dns-alert-wash:#fff4df;max-width:1050px;margin:0 auto}:root[data-theme=dark] .dns-report{--dns-line:#35443a;--dns-accent:#a9d4ae;--dns-alert:#f1c778;--dns-alert-wash:#382f20}.sr-only{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0}.dns-heading{display:flex;align-items:center;justify-content:space-between;gap:16px;padding:4px 4px 18px;border-bottom:1px solid var(--dns-line)}.dns-eyebrow{margin:0 0 3px;color:var(--dns-accent);font:700 10px/1.4 'IBM Plex Mono',ui-monospace,monospace;letter-spacing:.12em}.dns-heading h3{margin:0;font:700 clamp(19px,3vw,25px)/1.2 Manrope,system-ui,sans-serif;overflow-wrap:anywhere}.dns-scope{flex:none;padding:6px 9px;border:1px solid var(--dns-line);border-radius:5px;color:var(--dns-accent);font:600 10px/1 'IBM Plex Mono',ui-monospace,monospace;letter-spacing:.04em}.dns-table-scroll{overflow-x:auto}table{width:100%;border-collapse:collapse;table-layout:fixed}thead th{padding:12px 14px;text-align:left;color:var(--muted);font:600 10px/1.3 'IBM Plex Mono',ui-monospace,monospace;letter-spacing:.07em;border-bottom:1px solid var(--dns-line)}thead th:first-child{width:76px}thead th:nth-child(3){border-left:1px solid var(--dns-line)}tbody tr{border-bottom:1px solid var(--dns-line)}tbody tr:last-child{border-bottom:0}tbody th,tbody td{padding:11px 14px;text-align:left;vertical-align:top}tbody th{position:relative;color:var(--ink)}tbody th code{display:inline-block;padding:4px 6px;border-left:2px solid var(--dns-accent);background:color-mix(in srgb,var(--dns-accent) 8%,var(--paper));font:700 11px/1.2 'IBM Plex Mono',ui-monospace,monospace}tbody td:nth-child(3){border-left:1px solid var(--dns-line)}tbody td{overflow-wrap:anywhere}.dns-status{display:inline-block;margin:0 0 7px;padding:3px 5px;border-radius:3px;font:600 9px/1.2 'IBM Plex Mono',ui-monospace,monospace;letter-spacing:.03em}.dns-ok{color:var(--dns-accent);background:color-mix(in srgb,var(--dns-accent) 11%,var(--paper))}.dns-status-error,.dns-failure{color:var(--dns-alert);background:var(--dns-alert-wash)}.dns-values{display:grid;gap:8px}.dns-answer{display:grid;justify-items:start;gap:4px}.dns-answer code,td>code{font:500 11px/1.55 'IBM Plex Mono',ui-monospace,monospace;overflow-wrap:anywhere}.dns-ttl,.dns-note,.dns-empty,.dns-failure{font-size:10px;line-height:1.5;color:var(--muted)}.dns-ttl{font-family:'IBM Plex Mono',ui-monospace,monospace;font-variant-numeric:tabular-nums}.dns-note{color:var(--dns-accent)}.dns-empty{display:block}.dns-failure{display:block;width:max-content;max-width:100%;margin-bottom:4px;padding:3px 5px;color:var(--dns-alert);font-family:'IBM Plex Mono',ui-monospace,monospace}.dns-row-different{background:var(--dns-alert-wash)}.dns-row-different th code{border-color:var(--dns-alert)}.dns-difference{display:block;margin-top:5px;color:var(--dns-alert);font:700 15px/1 'IBM Plex Mono',ui-monospace,monospace}.dns-foot{display:flex;flex-wrap:wrap;gap:14px;padding:12px 4px 2px;border-top:1px solid var(--dns-line);color:var(--muted);font-size:10px}.dns-foot span{display:inline-flex;align-items:center;gap:6px}.dns-legend-match,.dns-legend-diff{width:7px;height:7px;border-radius:50%;background:var(--dns-accent)}.dns-legend-diff{display:inline-grid;width:14px;height:14px;place-items:center;border-radius:3px;background:var(--dns-alert-wash);color:var(--dns-alert);font:700 10px/1 'IBM Plex Mono',ui-monospace,monospace}@media(max-width:560px){body{padding:8px}.dns-heading{padding-bottom:13px}thead{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0}table,tbody,tr,th,td{display:block;width:100%}tbody tr{display:grid;grid-template-columns:1fr 1fr;padding:8px 0}tbody th{grid-column:1/-1;padding:4px 8px 8px}tbody td{padding:7px 8px;border-left:0!important}tbody td::before{content:attr(data-resolver);display:block;margin-bottom:5px;color:var(--muted);font:600 9px/1.3 'IBM Plex Mono',ui-monospace,monospace;letter-spacing:.05em}.dns-difference{display:inline-block;margin:0 0 0 7px;vertical-align:middle}.dns-foot{gap:10px}}`;
	return preview(body, css);
}

async function lookup(
	domainInput: string,
	typeInput: string,
): Promise<{
	readonly output: string;
	readonly preview: string;
}> {
	const domain = normalizeDomain(domainInput);
	if (!isQueryType(typeInput)) {
		throw new Error('Choose a supported DNS record type.');
	}
	const types = typeInput === 'ALL' ? RECORD_TYPE_LIST : [typeInput];
	const outcomes: readonly ResolverResult[] = await Promise.all(
		RESOLVERS.map(async (resolver) => {
			const records = await Promise.all(
				types.map(async (type) => {
					try {
						return {
							type,
							response: await queryResolver(resolver.endpoint, domain, type),
						};
					} catch (error) {
						return {
							type,
							error: error instanceof Error ? error.message : 'Network request failed',
						};
					}
				}),
			);
			return { name: resolver.name, records };
		}),
	);
	const responses = new Map<RecordType, Map<ResolverName, DnsResponse>>();
	let successfulQueries = 0;
	const lines = [`DNS lookup for ${domain} — ${typeInput}`, ''];
	for (const outcome of outcomes) {
		lines.push(outcome.name);
		for (const record of outcome.records) {
			if (typeInput === 'ALL') {
				lines.push(`  ${record.type}`);
			}
			if ('error' in record) {
				lines.push(`    Query failed (${record.error})`);
				continue;
			}
			successfulQueries += 1;
			const response = record.response;
			lines.push(`    ${statusLabel(response.Status)}`);
			const answers = (response.Answer ?? []).filter(
				(answer) => answer.type === RECORD_TYPES[record.type],
			);
			if (answers.length) {
				lines.push(...answers.map((answer) => `  ${answerLine(domain, record.type, answer)}`));
			} else {
				lines.push(
					response.Status === 3 ? '    Domain does not exist.' : '    No records returned.',
				);
			}
			const typeResponses = responses.get(record.type) ?? new Map<ResolverName, DnsResponse>();
			typeResponses.set(outcome.name, response);
			responses.set(record.type, typeResponses);
		}
		lines.push('');
	}
	if (successfulQueries === 0) {
		throw new Error('Both DNS resolvers failed. Check your connection and try again.');
	}
	for (const type of types) {
		const typeResponses = responses.get(type);
		if (typeResponses?.size === 2) {
			const comparison = compareAnswers(typeResponses, type);
			if (comparison) {
				lines.push(`${type}: ${comparison.trim()}`);
			}
		}
	}
	lines.push('Queries are sent to Cloudflare and Google DNS over HTTPS.');
	return {
		output: lines.join('\n'),
		preview: renderPreview(domain, typeInput, types, outcomes),
	};
}

export const definition = tool(
	'dns-lookup',
	[
		input('domain', 'tools.dns-lookup.domain_name', 'example.com', 'text'),
		select('type', 'tools.dns-lookup.record_type', [
			['ALL', 'tools.dns-lookup.all_record_types'],
			['A'],
			['AAAA'],
			['CNAME'],
			['MX'],
			['TXT'],
			['NS'],
			['SOA'],
			['SRV'],
			['CAA'],
		]),
	],
	async (values) => lookup(field(values, 'domain'), field(values, 'type')),
	undefined,
	'tools.dns-lookup.queries_use_https_and_compare_cloudflare_and_google',
);

export { normalizeDomain, parseResponse, compareAnswers };
