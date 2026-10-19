import Papa from 'papaparse';
import XMLBuilder from 'fast-xml-builder';
import { stringify } from 'yaml';
import { yamlToJson } from '@app/features/tools/json-yaml.tool';
import {
	tool,
	source,
	input,
	field,
	result,
	json,
	escapeHtml,
	preview,
} from '@app/features/tools/extended/common';
import { rowsFrom, sqlInsert } from '@app/features/tools/extended/data-utils';
import { generateTypes } from '@app/features/tools/extended/type-generation';
import { runDataTask as task } from '@app/features/tools/extended/data-runner';

const sample = {
	input: '[{"id":1,"name":"Ana","active":true},{"id":2,"name":"Bruno","active":false}]',
};
export const definitions = [
	tool(
		'json-validator',
		[source],
		(v) => {
			json(field(v, 'input'));
			return result({ valid: true });
		},
		{ input: '{"valid":true}' },
	),
	tool(
		'json-viewer',
		[source],
		(v) => {
			const value = json(field(v, 'input'));
			const tree = (val: unknown, depth = 0): string => {
				if (depth > 30) {
					throw new Error('Profundidade máxima: 30 / Max depth: 30');
				}
				if (val === null || typeof val !== 'object') {
					return escapeHtml(JSON.stringify(val));
				}
				return `<details open><summary>${Array.isArray(val) ? 'Array' : 'Object'} (${Object.keys(val).length})</summary><ul>${Object.entries(
					val,
				)
					.map(
						([key, item]) =>
							`<li><strong>${escapeHtml(key)}</strong>: ${tree(item, depth + 1)}</li>`,
					)
					.join('')}</ul></details>`;
			};
			return { ...result(value), preview: preview(tree(value)) };
		},
		sample,
	),
	tool(
		'jsonpath',
		[source, input('path', 'JSONPath', 'JSONPath', '$.items[*].name', 'text')],
		async (v) => result(await task('path', field(v, 'input'), field(v, 'path'))),
		{ input: '{"items":[{"name":"Ana"},{"name":"Bruno"}]}', path: '$.items[*].name' },
	),
	tool(
		'json-schema',
		[source, input('schema', 'JSON Schema (Draft 7)', 'JSON Schema (Draft 7)')],
		async (v) => result(await task('schema', field(v, 'input'), field(v, 'schema'))),
		{
			input: '{"name":"Ana"}',
			schema: '{"type":"object","properties":{"name":{"type":"string"}},"required":["name"]}',
		},
	),
	tool(
		'json-typescript',
		[source],
		(v) => result(generateTypes(json(field(v, 'input')), 'ts'), 'types.ts'),
		sample,
	),
	tool(
		'json-csharp-interface',
		[source],
		(v) => result(generateTypes(json(field(v, 'input')), 'interface'), 'Interfaces.cs'),
		sample,
	),
	tool(
		'json-csv',
		[source],
		(v) =>
			result(Papa.unparse(rowsFrom(json(field(v, 'input'))), { escapeFormulae: true }), 'data.csv'),
		sample,
	),
	tool(
		'csv-json',
		[source],
		(v) => {
			const parsed = Papa.parse<Record<string, string>>(field(v, 'input'), {
				header: true,
				skipEmptyLines: true,
			});
			if (parsed.errors.length) {
				throw new Error(parsed.errors.map((e) => e.message).join('\n'));
			}
			return result(parsed.data);
		},
		{ input: 'id,name\n1,Ana\n2,Bruno' },
	),
	tool(
		'json-to-yaml',
		[source],
		(v) => result(stringify(json(field(v, 'input'))), 'data.yaml'),
		sample,
	),
	tool('yaml-to-json', [source], (v) => result(yamlToJson(field(v, 'input'))), {
		input: 'name: Ana\nactive: true',
	}),
	tool(
		'json-xml',
		[source],
		(v) =>
			result(
				new XMLBuilder({ format: true, ignoreAttributes: false }).build({
					root: json(field(v, 'input')),
				}),
				'data.xml',
			),
		sample,
	),
	tool(
		'json-sql',
		[source, input('table', 'Tabela', 'Table', 'data', 'text')],
		(v) => result(sqlInsert(rowsFrom(json(field(v, 'input'))), field(v, 'table')), 'data.sql'),
		sample,
	),
	tool(
		'schema-faker',
		[source],
		async (v) => result(await task('faker', field(v, 'input')), 'synthetic.json'),
		{
			input:
				'{"type":"object","properties":{"id":{"type":"integer","minimum":1,"maximum":100},"name":{"type":"string","minLength":3,"maxLength":12}},"required":["id","name"]}',
		},
	),
];
