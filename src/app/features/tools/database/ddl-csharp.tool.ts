import { tool, result } from '@app/features/tools/_shared/definition';

import { source } from '@app/features/tools/_shared/controls';

import { field, text } from '@app/core/models/tool';

import { object } from '@app/features/tools/_shared/data';

import { typeName } from '@app/features/tools/json/type-generation';

import { parseDdl, ddlExample } from '@app/features/tools/database/ddl';

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

export const definition = tool(
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
);
