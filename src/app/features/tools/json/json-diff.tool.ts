import { field, text, type ToolDefinition } from '@app/core/models/tool';
import { canonicalJson, lineDiff } from '@app/features/tools/_shared/difference';
import { input } from '@app/features/tools/_shared/controls';

export const definition: ToolDefinition = {
	id: 'json-diff',
	controls: [
		input('input', 'JSON original', 'Original JSON', undefined, undefined, 'tools.json-diff'),
		input('second', 'JSON modificado', 'Modified JSON', undefined, undefined, 'tools.json-diff'),
	],
	action: text('Comparar JSON', 'Compare JSON', undefined, 'tools.json-diff'),
	hint: text(
		'Compara estruturas, ignorando a ordem das chaves. − removido, + adicionado.',
		'Compares structures, ignoring key order. − removed, + added.',
		undefined,
		'tools.json-diff',
	),
	example: { input: '{"name":"Ana","active":false}', second: '{"active":true,"name":"Ana"}' },
	run: (v) => ({
		output: lineDiff(
			JSON.stringify(canonicalJson(JSON.parse(field(v, 'input'))), null, 2),
			JSON.stringify(canonicalJson(JSON.parse(field(v, 'second'))), null, 2),
		),
		filename: 'json.diff',
	}),
};
