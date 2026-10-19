import { field, text, type ToolDefinition } from '@app/core/models/tool';
import { lineDiff } from '@app/features/tools/_shared/difference';
import { input } from '@app/features/tools/_shared/controls';

export const definition: ToolDefinition = {
	id: 'text-diff',
	controls: [
		input('input', 'Texto original', 'Original text', undefined, undefined, 'tools.text-diff'),
		input('second', 'Texto modificado', 'Modified text', undefined, undefined, 'tools.text-diff'),
	],
	action: text('Comparar textos', 'Compare text', undefined, 'tools.text-diff'),
	hint: text(
		'Comparação por linhas: − removido, + adicionado.',
		'Line comparison: − removed, + added.',
		undefined,
		'tools.text-diff',
	),
	example: { input: 'Olá, mundo!\nToolbox', second: 'Olá, Brasil!\nToolbox' },
	run: (v) => ({ output: lineDiff(field(v, 'input'), field(v, 'second')), filename: 'text.diff' }),
};
