import { field } from '@app/core/models/tool';

import { number } from '@app/features/tools/_shared/controls';

import { result, tool } from '@app/features/tools/_shared/definition';

export const definition = tool(
	'rule-of-three',
	[
		number('a', 'A', 'A', 2, -1_000_000_000, 1_000_000_000, 'any'),
		number('b', 'B', 'B', 4, -1_000_000_000, 1_000_000_000, 'any'),
		number('c', 'C', 'C', 3, -1_000_000_000, 1_000_000_000, 'any'),
	],
	(v) => {
		const a = Number(field(v, 'a'));
		if (a === 0) {
			throw new Error('A não pode ser zero / A cannot be zero');
		}
		return result({
			x: (Number(field(v, 'b')) * Number(field(v, 'c'))) / a,
			equation: 'A/B = C/X',
		});
	},
);
