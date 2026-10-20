import { field, type ToolDefinition } from '@app/core/models/tool';
import { canonicalJson, lineDiff } from '@app/features/tools/_shared/difference';
import { input } from '@app/features/tools/_shared/controls';

export const definition: ToolDefinition = {
	id: 'json-diff',
	controls: [
		input('input', 'tools.json-diff.original_json', undefined, undefined),
		input('second', 'tools.json-diff.modified_json', undefined, undefined),
	],
	action: 'tools.json-diff.compare_json',
	hint: 'tools.json-diff.compares_structures_ignoring_key_order_rem',
	example: { input: '{"name":"Ana","active":false}', second: '{"active":true,"name":"Ana"}' },
	run: (v) => ({
		output: lineDiff(
			JSON.stringify(canonicalJson(JSON.parse(field(v, 'input'))), null, 2),
			JSON.stringify(canonicalJson(JSON.parse(field(v, 'second'))), null, 2),
		),
		filename: 'json.diff',
	}),
};
