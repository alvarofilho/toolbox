import { field } from '@app/core/models/tool';

import { input } from '@app/features/tools/_shared/controls';

import { result, tool } from '@app/features/tools/_shared/definition';

export const definition = tool(
	'keycode',
	[
		input('key', 'tools.keycode.key_event_key', 'Enter', 'text'),
		input('code', 'tools.keycode.physical_code_event_code', 'Enter', 'text'),
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
