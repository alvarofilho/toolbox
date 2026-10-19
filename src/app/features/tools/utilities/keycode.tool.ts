import { field } from '@app/core/models/tool';

import { input } from '@app/features/tools/_shared/controls';

import { result, tool } from '@app/features/tools/_shared/definition';

export const definition = tool(
	'keycode',
	[
		input('key', 'Tecla (event.key)', 'Key (event.key)', 'Enter', 'text', 'tools.keycode'),
		input(
			'code',
			'Código físico (event.code)',
			'Physical code (event.code)',
			'Enter',
			'text',
			'tools.keycode',
		),
	],
	(v) => {
		const key = field(v, 'key');
		const code = field(v, 'code');
		if (!key || !code) {
			throw new Error('Informe key e code / Enter key and code');
		}
		return result({
			key,
			code,
			isModifier: ['Alt', 'AltGraph', 'Control', 'Meta', 'Shift'].includes(key),
			isPrintable:
				Array.from(new Intl.Segmenter(undefined, { granularity: 'grapheme' }).segment(key))
					.length === 1,
		});
	},
);
