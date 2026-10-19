import { boundedNumber, field } from '@app/core/models/tool';

import { number } from '@app/features/tools/_shared/controls';

import { result, tool } from '@app/features/tools/_shared/definition';

import { randomInt } from '@app/features/tools/_shared/random';

export const definition = tool(
	'random-number',
	[
		number(
			'min',
			'Mínimo',
			'Minimum',
			1,
			-1_000_000_000,
			1_000_000_000,
			undefined,
			'tools.random-number',
		),
		number(
			'max',
			'Máximo',
			'Maximum',
			100,
			-1_000_000_000,
			1_000_000_000,
			undefined,
			'tools.random-number',
		),
		number('count', 'Quantidade', 'Count', 1, 1, 1000, undefined, 'tools.random-number'),
	],
	(v) => {
		const min = Number(field(v, 'min'));
		const max = Number(field(v, 'max'));
		if (
			!Number.isSafeInteger(min) ||
			!Number.isSafeInteger(max) ||
			max < min ||
			max - min >= 0x100000000
		) {
			throw new Error('Intervalo inteiro inválido / Invalid integer range');
		}
		const length = boundedNumber(field(v, 'count'), 1, 1000);
		return result(Array.from({ length }, () => min + randomInt(max - min + 1)));
	},
);
