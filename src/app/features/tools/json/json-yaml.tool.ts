import { parseDocument, stringify } from 'yaml';
import { field, type ToolDefinition } from '@app/core/models/tool';
import { source, select, transform } from '@app/features/tools/_shared/controls';

export function yamlToJson(input: string): string {
	if (!input.trim()) {
		throw new Error('YAML vazio / Empty YAML');
	}
	const document = parseDocument(input, { uniqueKeys: true });
	if (document.errors.length) {
		throw new Error(document.errors.map((e) => e.message).join('\n'));
	}
	const value: unknown = document.toJS({ maxAliasCount: 50 });
	const result = JSON.stringify(value, null, 2);
	if (result === undefined) {
		throw new Error('YAML vazio / Empty YAML');
	}
	if (result.length > 1000000) {
		throw new Error('Resultado muito grande / Output too large');
	}
	return result;
}
export const definition: ToolDefinition = {
	id: 'json-yaml',
	controls: [
		source,
		select('mode', 'Direção', 'Direction', [
			['yaml', 'JSON → YAML', 'JSON → YAML'],
			['json', 'YAML → JSON', 'YAML → JSON'],
		]),
	],
	action: transform,
	example: { input: '{"project":"Toolbox","local":true,"tools":["JSON","CPF"]}', mode: 'yaml' },
	run: (v) =>
		field(v, 'mode') === 'yaml'
			? {
					output: stringify(JSON.parse(field(v, 'input'))),
					filename: 'converted.yaml',
					mime: 'application/yaml',
				}
			: {
					output: yamlToJson(field(v, 'input')),
					filename: 'converted.json',
					mime: 'application/json',
				},
};
