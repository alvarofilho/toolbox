import { Parser } from 'node-sql-parser/build/postgresql';
import { Temporal } from '@js-temporal/polyfill';
import { compare } from 'fast-json-patch';
import { convertCase } from '@app/shared/utils/encoding';
import {
	tool,
	source,
	second,
	input,
	mode,
	select,
	count,
	boundedNumber,
	field,
	result,
	object,
	json,
	text,
} from '@app/features/tools/extended/common';
import { rowsFrom, sqlInsert } from '@app/features/tools/extended/data-utils';
import { generateTypes, typeName } from '@app/features/tools/extended/type-generation';
import { synthetic } from '@app/features/tools/controls';
import { people, PERSON_FIELDS } from '@app/shared/utils/person';

const table = input('table', 'Tabela', 'Table', 'synthetic_data', 'text');
const ddlExample = {
	input:
		'CREATE TABLE users (id INT PRIMARY KEY, name VARCHAR(255) NOT NULL, active BOOLEAN, created_at TIMESTAMP);',
};
export function parseDdl(sql: string): Record<string, unknown>[] {
	const parsed: unknown = new Parser().astify(sql, { database: 'Postgresql' });
	const statements = (Array.isArray(parsed) ? parsed : [parsed]).map(object);
	if (
		!statements.length ||
		statements.some((s) => s['type'] !== 'create' || s['keyword'] !== 'table')
	) {
		throw new Error('Use somente CREATE TABLE (PostgreSQL) / Use only PostgreSQL CREATE TABLE');
	}
	return statements;
}

function columnName(value: unknown): string {
	if (typeof value === 'string') {
		return value;
	}
	const record = object(value);
	if (typeof record['value'] === 'string') {
		return record['value'];
	}
	return columnName(record['expr']);
}
const csTypes: Record<string, string> = {
	INT: 'int',
	INTEGER: 'int',
	SMALLINT: 'short',
	BIGINT: 'long',
	SERIAL: 'int',
	BIGSERIAL: 'long',
	BOOLEAN: 'bool',
	BOOL: 'bool',
	NUMERIC: 'decimal',
	DECIMAL: 'decimal',
	REAL: 'float',
	FLOAT: 'double',
	DOUBLE: 'double',
	DATE: 'DateOnly',
	TIMESTAMP: 'DateTime',
	TIMESTAMPTZ: 'DateTimeOffset',
	UUID: 'Guid',
	BYTEA: 'byte[]',
	JSON: 'System.Text.Json.JsonElement',
	JSONB: 'System.Text.Json.JsonElement',
	TEXT: 'string',
	VARCHAR: 'string',
	CHAR: 'string',
};
export const definitions = [
	tool(
		'ddl-csharp',
		[source],
		(v) => {
			const classes = parseDdl(field(v, 'input')).map((statement) => {
				const tables = statement['table'];
				if (!Array.isArray(tables) || !tables.length) {
					throw new Error('Missing table');
				}
				const name = typeName(String(object(tables[0])['table']));
				const columns = statement['create_definitions'];
				if (!Array.isArray(columns)) {
					throw new Error('Missing columns');
				}
				return `public class ${name} {\n${columns
					.map(object)
					.filter((c) => c['resource'] === 'column')
					.map((c) => {
						const definition = object(c['definition']),
							sqlType = String(definition['dataType']).toUpperCase(),
							type = csTypes[sqlType];
						if (!type) {
							throw new Error(`Tipo SQL não mapeado / Unmapped SQL type: ${sqlType}`);
						}
						const col = columnName(object(c['column'])['column']);
						const required =
							!!c['primary_key'] ||
							(c['nullable'] !== undefined && object(c['nullable'])['type'] === 'not null');
						return `  [System.ComponentModel.DataAnnotations.Schema.Column(${JSON.stringify(col)})]\n  public ${type}${required ? '' : '?'} ${typeName(col)} { get; set; }`;
					})
					.join('\n')}\n}`;
			});
			return result(`#nullable enable\nusing System;\n\n${classes.join('\n\n')}`, 'Models.cs');
		},
		ddlExample,
		text(
			'Entrada: CREATE TABLE no dialeto PostgreSQL. Tipos sem mapeamento são informados como erro.',
			'Input: PostgreSQL CREATE TABLE. Unmapped types are reported as errors.',
		),
	),
	tool(
		'json-csharp',
		[source],
		(v) => result(generateTypes(json(field(v, 'input')), 'class'), 'Models.cs'),
		{ input: '{"id":1,"name":"Ana","active":true,"address":{"city":"São Paulo"}}' },
	),
	tool(
		'sql-insert',
		[source, table],
		(v) => result(sqlInsert(rowsFrom(json(field(v, 'input'))), field(v, 'table')), 'inserts.sql'),
		{ input: '[{"id":1,"name":"Ana"},{"id":2,"name":"Bruno"}]' },
	),
	tool(
		'database-seed',
		[count, table],
		(v) =>
			result(
				sqlInsert(
					people(boundedNumber(field(v, 'count'), 1, 1000), PERSON_FIELDS, 'SP', 18, 65),
					field(v, 'table'),
				),
				'synthetic-seed.sql',
			),
		undefined,
		synthetic,
	),
	tool(
		'connection-string',
		[
			select('provider', 'Provedor', 'Provider', [
				['sqlserver', 'SQL Server / ADO.NET', 'SQL Server / ADO.NET'],
				['postgresql', 'PostgreSQL / Npgsql', 'PostgreSQL / Npgsql'],
				['mysql', 'MySQL / MySqlConnector', 'MySQL / MySqlConnector'],
				['sqlite', 'SQLite / Microsoft.Data.Sqlite', 'SQLite / Microsoft.Data.Sqlite'],
			]),
			input('host', 'Servidor', 'Host', 'localhost', 'text'),
			input('port', 'Porta (opcional)', 'Port (optional)', '', 'text'),
			input('database', 'Banco ou caminho SQLite', 'Database or SQLite path', 'app', 'text'),
			input('user', 'Usuário', 'User', 'app', 'text'),
			input('password', 'Senha', 'Password', '', 'password'),
			select('tls', 'TLS', 'TLS', [
				['true', 'Exigir TLS', 'Require TLS'],
				['false', 'Desabilitado', 'Disabled'],
			]),
		],
		(v) => {
			const q = (s: string) => `"${s.replace(/"/g, '""')}"`;
			const port = field(v, 'port');
			if (port && (!/^\d+$/.test(port) || Number(port) < 1 || Number(port) > 65535)) {
				throw new Error('Porta inválida / Invalid port');
			}
			const host = field(v, 'host'),
				db = q(field(v, 'database')),
				user = q(field(v, 'user')),
				pw = q(field(v, 'password')),
				tls = field(v, 'tls') === 'true';
			switch (field(v, 'provider')) {
				case 'sqlserver':
					return result(
						`Server=${q(host + (port ? `,${port}` : ''))};Database=${db};User Id=${user};Password=${pw};Encrypt=${tls ? 'True' : 'False'};TrustServerCertificate=False;`,
						'connection.txt',
					);
				case 'postgresql':
					return result(
						`Host=${q(host)};Port=${port || '5432'};Database=${db};Username=${user};Password=${pw};SSL Mode=${tls ? 'VerifyFull' : 'Disable'};`,
						'connection.txt',
					);
				case 'mysql':
					return result(
						`Server=${q(host)};Port=${port || '3306'};Database=${db};User ID=${user};Password=${pw};SslMode=${tls ? 'VerifyFull' : 'Disabled'};`,
						'connection.txt',
					);
				case 'sqlite':
					return result(`Data Source=${db};Mode=ReadWriteCreate;`, 'connection.txt');
				default:
					throw new Error('Provedor inválido / Invalid provider');
			}
		},
	),
	tool(
		'dotnet-ticks',
		[source, mode(['ticks-to-iso', 'iso-to-ticks'])],
		(v) => {
			const offset = 621355968000000000n;
			if (field(v, 'mode') === 'iso-to-ticks') {
				const raw = field(v, 'input').trim();
				if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,7})?(?:Z|[+-]\d{2}:\d{2})$/.test(raw)) {
					throw new Error('ISO 8601 com fuso obrigatório / ISO 8601 with timezone required');
				}
				const ticks = Temporal.Instant.from(raw).epochNanoseconds / 100n + offset;
				if (ticks < 0n || ticks > 3155378975999999999n) {
					throw new Error('Fora do intervalo DateTime / Outside DateTime range');
				}
				return result({ ticks: ticks.toString() });
			}
			if (!/^\d{1,19}$/.test(field(v, 'input').trim())) {
				throw new Error('Ticks inválidos / Invalid ticks');
			}
			const ticks = BigInt(field(v, 'input'));
			if (ticks > 3155378975999999999n) {
				throw new Error('Fora do intervalo DateTime / Outside DateTime range');
			}
			const delta = ticks - offset,
				ms = delta >= 0n ? delta / 10000n : (delta - 9999n) / 10000n;
			const fraction = (ticks % 10000000n).toString().padStart(7, '0');
			return result({
				utc: new Date(Number(ms)).toISOString().replace(/\.\d{3}Z$/, `.${fraction}Z`),
				ticks: ticks.toString(),
			});
		},
		{ input: '621355968000000000' },
	),
	tool(
		'guid-formatter',
		[
			source,
			select(
				'format',
				'Formato',
				'Format',
				['D', 'N', 'B', 'P', 'X'].map((s) => [s, s, s]),
			),
		],
		(v) => {
			const raw = field(v, 'input').trim();
			let s: string;
			if (
				/^\{0x[\da-f]{8},0x[\da-f]{4},0x[\da-f]{4},\{(?:0x[\da-f]{2},){7}0x[\da-f]{2}\}\}$/i.test(
					raw,
				)
			) {
				s = raw.replace(/0x/gi, '').replace(/[{},]/g, '');
			} else if (
				/^(?:[\da-f]{32}|[\da-f]{8}-(?:[\da-f]{4}-){3}[\da-f]{12}|\{[\da-f]{8}-(?:[\da-f]{4}-){3}[\da-f]{12}\}|\([\da-f]{8}-(?:[\da-f]{4}-){3}[\da-f]{12}\))$/i.test(
					raw,
				)
			) {
				s = raw.replace(/[{}()-]/g, '');
			} else {
				throw new Error('GUID inválido / Invalid GUID');
			}
			s = s.toLowerCase();
			const d = `${s.slice(0, 8)}-${s.slice(8, 12)}-${s.slice(12, 16)}-${s.slice(16, 20)}-${s.slice(20)}`;
			return result(
				field(v, 'format') === 'N'
					? s
					: field(v, 'format') === 'B'
						? `{${d}}`
						: field(v, 'format') === 'P'
							? `(${d})`
							: field(v, 'format') === 'X'
								? `{0x${s.slice(0, 8)},0x${s.slice(8, 12)},0x${s.slice(12, 16)},{${(s.slice(16).match(/../g) ?? []).map((b) => `0x${b}`).join(',')}}}`
								: d,
				'guid.txt',
			);
		},
		{ input: '550e8400e29b41d4a716446655440000' },
	),
	tool(
		'csharp-escape',
		[source, mode(['regular', 'verbatim'])],
		(v) =>
			result(
				field(v, 'mode') === 'verbatim'
					? `@"${field(v, 'input').replace(/"/g, '""')}"`
					: JSON.stringify(field(v, 'input')),
				'literal.cs',
			),
		{ input: 'C:\\Users\\Test\n"Hello"' },
	),
	tool(
		'pascal-camel',
		[source, mode(['pascal', 'camel'])],
		(v) => result(convertCase(field(v, 'input'), field(v, 'mode')), 'case.txt'),
		{ input: 'minha primeira ferramenta' },
	),
	tool(
		'sql-schema-diff',
		[source, second],
		(v) =>
			result(
				compare({ tables: parseDdl(field(v, 'input')) }, { tables: parseDdl(field(v, 'second')) }),
				'schema-diff.json',
			),
		{
			input: ddlExample.input,
			second: ddlExample.input.replace('name VARCHAR(255)', 'name VARCHAR(100)'),
		},
		text(
			'Compara ASTs de CREATE TABLE PostgreSQL. A saída descreve diferenças; não executa migrações.',
			'Compares PostgreSQL CREATE TABLE ASTs. Output describes differences; migrations are not executed.',
		),
	),
];
