import { tool, result } from '@app/features/tools/_shared/definition';

import { source } from '@app/features/tools/_shared/controls';

import { field } from '@app/core/models/tool';

export const definition = tool(
	'binary-text',
	[source],
	(v) => {
		const s = field(v, 'input').replace(/\s/g, '');
		if (!/^(?:[01]{8})+$/.test(s)) {
			throw new Error('Use bytes de 8 bits / Use 8-bit bytes');
		}
		return result(
			new TextDecoder('utf-8', { fatal: true }).decode(
				Uint8Array.from(s.match(/.{8}/g) ?? [], (b) => parseInt(b, 2)),
			),
			'text.txt',
		);
	},
	{ input: '01001000 01101001' },
);
