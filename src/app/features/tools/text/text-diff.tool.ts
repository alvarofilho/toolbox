import { field, type ToolDefinition } from '@app/core/models/tool';
import { lineDiff } from '@app/features/tools/_shared/difference';
import { input } from '@app/features/tools/_shared/controls';

export const definition: ToolDefinition = {
	id: 'text-diff',
	controls: [
		input('input', 'tools.text-diff.original_text', undefined, undefined),
		input('second', 'tools.text-diff.modified_text', undefined, undefined),
	],
	action: 'tools.text-diff.compare_text',
	hint: 'tools.text-diff.line_comparison_removed_added',
	example: { input: 'Olá, mundo!\nToolbox', second: 'Olá, Brasil!\nToolbox' },
	run: (v) => ({ output: lineDiff(field(v, 'input'), field(v, 'second')), filename: 'text.diff' }),
};
