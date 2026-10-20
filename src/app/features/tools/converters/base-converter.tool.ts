import { tool, result } from '@app/features/tools/_shared/definition';

import { source, select } from '@app/features/tools/_shared/controls';

import { field } from '@app/core/models/tool';

export const definition = tool(
	'base-converter',
	[
		source,
		select(
			'from',
			'tools.base-converter.input_base',
			[
				['2', 'tools.base-converter.2'],
				['10', 'tools.base-converter.10'],
				['16', 'tools.base-converter.16'],
			],
			'10',
		),
	],
	(v) => {
		const s = field(v, 'input').trim(),
			base = field(v, 'from');
		if (
			!s ||
			s.length > 10000 ||
			!(base === '2' ? /^-?[01]+$/ : base === '16' ? /^-?[0-9a-f]+$/i : /^-?\d+$/).test(s)
		) {
			throw new Error('Número inválido / Invalid number');
		}
		const n =
			(s.startsWith('-') ? -1n : 1n) *
			BigInt((base === '2' ? '0b' : base === '16' ? '0x' : '') + s.replace(/^-/, ''));
		return result({
			binary: n.toString(2),
			decimal: n.toString(10),
			hexadecimal: n.toString(16),
		});
	},
	{ input: '255' },
);
