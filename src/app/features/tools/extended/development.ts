import { format } from 'sql-formatter';
import XMLBuilder from 'fast-xml-builder';
import { XMLParser, XMLValidator } from 'fast-xml-parser';
import { stringify } from 'yaml';
import { CronExpressionParser } from 'cron-parser';
import cronstrue from 'cronstrue';
import { getReasonPhrase } from 'http-status-codes';
import { compare } from 'fast-json-patch';
import { parse, print } from 'graphql';
import semver from 'semver';
import { yamlToJson } from '@app/features/tools/json-yaml.tool';
import {
	tool,
	source,
	second,
	input,
	select,
	field,
	result,
	json,
	object,
	preview,
	escapeHtml,
	text,
} from '@app/features/tools/extended/common';

const sqlDialect = select('dialect', 'Dialeto', 'Dialect', [
	['sql', 'SQL', 'SQL'],
	['postgresql', 'PostgreSQL', 'PostgreSQL'],
	['mysql', 'MySQL', 'MySQL'],
	['transactsql', 'SQL Server', 'SQL Server'],
	['sqlite', 'SQLite', 'SQLite'],
]);
function xml(value: string): void {
	if (/<!DOCTYPE|<!ENTITY/i.test(value)) {
		throw new Error('DOCTYPE/ENTITY não permitidos / DOCTYPE/ENTITY not allowed');
	}
	const validation = XMLValidator.validate(value);
	if (validation !== true) {
		throw new Error(`${validation.err.msg} (${validation.err.line}:${validation.err.col})`);
	}
}

function cron(expression: string, zone: string, start: string): unknown {
	const currentDate = new Date(start);
	if (!Number.isFinite(currentDate.getTime())) {
		throw new Error('Data inválida / Invalid date');
	}
	const parsed = CronExpressionParser.parse(expression, { tz: zone, currentDate });
	return {
		expression,
		description: cronstrue.toString(expression),
		timezone: zone,
		next: Array.from({ length: 10 }, () => parsed.next().toISOString()),
	};
}

export function parseDocument(value: string): unknown {
	return json(yamlToJson(value));
}

export function openApi(value: string): {
	doc: Record<string, unknown>;
	operations: Record<string, unknown>[];
} {
	const doc = object(parseDocument(value));
	if (typeof doc['openapi'] !== 'string' && doc['swagger'] !== '2.0') {
		throw new Error('Esperado OpenAPI 3.x ou Swagger 2.0 / Expected OpenAPI 3.x or Swagger 2.0');
	}
	const info = object(doc['info']);
	if (typeof info['title'] !== 'string' || typeof info['version'] !== 'string') {
		throw new Error('info.title e info.version obrigatórios / required');
	}
	const paths = object(doc['paths'] ?? {}),
		operations: Record<string, unknown>[] = [];
	for (const [path, item] of Object.entries(paths)) {
		if (!path.startsWith('/')) {
			throw new Error('Paths devem começar com / / Paths must start with /');
		}
		for (const [method, entry] of Object.entries(object(item))) {
			if (!['get', 'put', 'post', 'delete', 'options', 'head', 'patch', 'trace'].includes(method)) {
				continue;
			}
			const operation = object(entry);
			operations.push({
				method: method.toUpperCase(),
				path,
				operationId: operation['operationId'] ?? null,
				summary: operation['summary'] ?? '',
				parameters: operation['parameters'] ?? [],
				responses: operation['responses'] ?? {},
			});
		}
	}
	return { doc, operations };
}
const apiExample =
	'openapi: 3.0.3\ninfo:\n  title: Example API\n  version: 1.0.0\npaths:\n  /users:\n    get:\n      summary: List users\n      responses:\n        "200":\n          description: OK';
const quote = (s: string) => `'${s.replace(/'/g, `'"'"'`)}'`;
export const definitions = [
	tool(
		'sql-formatter',
		[source, sqlDialect],
		(v) => {
			const dialect = field(v, 'dialect');
			if (
				dialect !== 'sql' &&
				dialect !== 'postgresql' &&
				dialect !== 'mysql' &&
				dialect !== 'transactsql' &&
				dialect !== 'sqlite'
			) {
				throw new Error('Invalid dialect');
			}
			return result(format(field(v, 'input'), { language: dialect }), 'formatted.sql');
		},
		{ input: 'select id,name from users where active=true order by name' },
	),
	tool(
		'xml-formatter',
		[source],
		(v) => {
			const value = field(v, 'input');
			xml(value);
			const parser = new XMLParser({
				ignoreAttributes: false,
				preserveOrder: true,
				processEntities: false,
			});
			return result(
				new XMLBuilder({ ignoreAttributes: false, preserveOrder: true, format: true }).build(
					parser.parse(value),
				),
				'formatted.xml',
			);
		},
		{ input: '<root><user id="1">Ana</user><user id="2">Bruno</user></root>' },
	),
	tool(
		'xml-validator',
		[source],
		(v) => {
			xml(field(v, 'input'));
			return result({ valid: true, validation: 'XML well-formedness; no XSD validation' });
		},
		{ input: '<root><item>Test</item></root>' },
	),
	tool(
		'yaml-formatter',
		[source],
		(v) => result(stringify(parseDocument(field(v, 'input'))), 'formatted.yaml'),
		{ input: 'name: Ana\nitems: [1, 2, 3]' },
	),
	tool(
		'cron-builder',
		[
			...['minute', 'hour', 'day', 'month', 'weekday'].map((key, i) =>
				input(
					key,
					['Minuto', 'Hora', 'Dia do mês', 'Mês', 'Dia da semana'][i],
					['Minute', 'Hour', 'Day of month', 'Month', 'Weekday'][i],
					i === 0 ? '*/15' : '*',
					'text',
				),
			),
			input('zone', 'Fuso IANA', 'IANA timezone', 'America/Sao_Paulo', 'text'),
			input('start', 'A partir de (ISO)', 'Starting at (ISO)', '2026-01-01T00:00:00Z', 'text'),
		],
		(v) =>
			result(
				cron(
					['minute', 'hour', 'day', 'month', 'weekday'].map((k) => field(v, k)).join(' '),
					field(v, 'zone'),
					field(v, 'start'),
				),
			),
	),
	tool(
		'cron-parser',
		[
			source,
			input('zone', 'Fuso IANA', 'IANA timezone', 'America/Sao_Paulo', 'text'),
			input('start', 'A partir de (ISO)', 'Starting at (ISO)', '2026-01-01T00:00:00Z', 'text'),
		],
		(v) => result(cron(field(v, 'input'), field(v, 'zone'), field(v, 'start'))),
		{ input: '*/15 * * * *' },
	),
	tool(
		'http-status',
		[
			input(
				'input',
				'Código HTTP (vazio para listar todos)',
				'HTTP code (empty to list all)',
				'200',
				'text',
			),
		],
		(v) => {
			const value = field(v, 'input').trim();
			const statuses = Array.from({ length: 500 }, (_, i) => i + 100).flatMap((code) => {
				try {
					return [
						{
							code,
							reason: getReasonPhrase(code),
							category: ['Informational', 'Success', 'Redirection', 'Client error', 'Server error'][
								Math.floor(code / 100) - 1
							],
						},
					];
				} catch {
					return [];
				}
			});
			if (!value) {
				return result(statuses);
			}
			if (!/^\d{3}$/.test(value)) {
				throw new Error('Código HTTP inválido / Invalid HTTP code');
			}
			const found = statuses.find((s) => s.code === Number(value));
			if (!found) {
				throw new Error('Código não registrado / Unregistered code');
			}
			return result(found);
		},
	),
	tool(
		'http-headers',
		[source],
		(v) => {
			const headers: Record<string, string[]> = {};
			Object.setPrototypeOf(headers, null);
			for (const line of field(v, 'input').split(/\r?\n/).filter(Boolean)) {
				if (/^HTTP\/\d(?:\.\d)? \d{3}/.test(line)) {
					continue;
				}
				const match = /^([!#$%&'*+.^_`|~\w-]+):\s*(.*)$/.exec(line);
				if (!match) {
					throw new Error(`Header inválido / Invalid header: ${line}`);
				}
				const key = match[1].toLowerCase();
				headers[key] = [...(headers[key] ?? []), match[2]];
			}
			return result({
				headers,
				duplicates: Object.keys(headers).filter((k) => headers[k].length > 1),
				missingSecurityHeaders: [
					'content-security-policy',
					'strict-transport-security',
					'x-content-type-options',
					'referrer-policy',
				].filter((k) => !headers[k]),
				note: 'Presence analysis only; values require contextual review.',
			});
		},
		{
			input:
				'HTTP/1.1 200 OK\nContent-Type: application/json\nCache-Control: no-store\nX-Content-Type-Options: nosniff',
		},
	),
	tool(
		'url-parser',
		[source],
		(v) => {
			const url = new URL(field(v, 'input'));
			return result({
				protocol: url.protocol,
				username: url.username,
				password: url.password,
				hostname: url.hostname,
				port: url.port,
				pathname: url.pathname,
				query: Array.from(url.searchParams.entries()),
				fragment: url.hash,
				origin: url.origin,
			});
		},
		{ input: 'https://example.com:8443/api/users?page=1&page=2#result' },
	),
	tool(
		'curl',
		[
			input('url', 'URL', 'URL', 'https://example.com/api', 'text'),
			select(
				'method',
				'Método',
				'Method',
				['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS'].map((m) => [m, m, m]),
			),
			input(
				'headers',
				'Headers (um por linha)',
				'Headers (one per line)',
				'Accept: application/json',
			),
			input('body', 'Corpo', 'Body'),
		],
		(v) => {
			const url = new URL(field(v, 'url'));
			if (!['http:', 'https:'].includes(url.protocol)) {
				throw new Error('Use HTTP(S)');
			}
			const method = field(v, 'method');
			if (!/^(GET|POST|PUT|PATCH|DELETE|HEAD|OPTIONS)$/.test(method)) {
				throw new Error('Invalid method');
			}
			const lines = [
				`curl --request ${method}`,
				...field(v, 'headers')
					.split(/\r?\n/)
					.filter(Boolean)
					.map((h) => `--header ${quote(h)}`),
				...(field(v, 'body') ? [`--data-raw ${quote(field(v, 'body'))}`] : []),
				`--url ${quote(url.toString())}`,
			];
			return result(lines.join(' \\\n  '), 'request.sh');
		},
	),
	tool(
		'json-patch',
		[source, second],
		(v) =>
			result(
				compare(object(json(field(v, 'input'))), object(json(field(v, 'second')))),
				'patch.json',
			),
		{ input: '{"name":"Ana","active":false}', second: '{"name":"Ana","active":true,"age":25}' },
	),
	tool(
		'openapi',
		[source],
		(v) => {
			const api = openApi(field(v, 'input'));
			return {
				...result({
					info: api.doc['info'],
					servers: api.doc['servers'] ?? [],
					operations: api.operations,
				}),
				preview: preview(
					`<h1>${escapeHtml(String(object(api.doc['info'])['title']))}</h1>${api.operations.map((op) => `<details><summary><b>${escapeHtml(String(op['method']))}</b> ${escapeHtml(String(op['path']))} — ${escapeHtml(String(op['summary']))}</summary><pre>${escapeHtml(JSON.stringify(op, null, 2))}</pre></details>`).join('')}`,
				),
			};
		},
		{ input: apiExample },
		text(
			'Visualiza operações de OpenAPI 3.x/Swagger 2.0; referências externas não são carregadas.',
			'Views OpenAPI 3.x/Swagger 2.0 operations; external references are not fetched.',
		),
	),
	tool(
		'openapi-diff',
		[source, second],
		(v) => {
			const before = openApi(field(v, 'input')),
				after = openApi(field(v, 'second'));
			const key = (op: Record<string, unknown>) => `${String(op['method'])} ${String(op['path'])}`;
			const oldKeys = before.operations.map(key),
				newKeys = after.operations.map(key);
			return result({
				added: newKeys.filter((k) => !oldKeys.includes(k)),
				removed: oldKeys.filter((k) => !newKeys.includes(k)),
				patch: compare(before.doc, after.doc),
				compatibilityAssessed: false,
			});
		},
		{ input: apiExample, second: apiExample.replace('1.0.0', '1.1.0') },
		text(
			'Diff estrutural com operações adicionadas/removidas. Não comprova compatibilidade entre versões.',
			'Structural diff with added/removed operations. Does not establish version compatibility.',
		),
	),
	tool('graphql', [source], (v) => result(print(parse(field(v, 'input'))), 'query.graphql'), {
		input: 'query Users($id:ID!){user(id:$id){id name email}}',
	}),
	tool(
		'semver',
		[
			source,
			second,
			input('range', 'Intervalo semver (opcional)', 'Semver range (optional)', '^1.0.0', 'text'),
		],
		(v) => {
			const a = field(v, 'input').trim(),
				b = field(v, 'second').trim(),
				range = field(v, 'range');
			if (!semver.valid(a) || !semver.valid(b)) {
				throw new Error('Versões semver inválidas / Invalid semver versions');
			}
			if (range && !semver.validRange(range)) {
				throw new Error('Intervalo inválido / Invalid range');
			}
			const compared = semver.compare(a, b);
			return result({
				first: a,
				second: b,
				comparison: compared,
				relation: compared < 0 ? 'older' : compared > 0 ? 'newer' : 'equal',
				firstSatisfies: range ? semver.satisfies(a, range) : null,
				secondSatisfies: range ? semver.satisfies(b, range) : null,
				difference: semver.diff(a, b),
			});
		},
		{ input: '1.2.3', second: '2.0.0' },
	),
];
