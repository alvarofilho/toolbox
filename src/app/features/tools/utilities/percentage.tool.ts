import { field } from '@app/core/models/tool';

import { number, select } from '@app/features/tools/_shared/controls';

import { result, tool } from '@app/features/tools/_shared/definition';

export const definition = tool(
	'percentage',
	[
		select(
			'operation',
			'Cálculo',
			'Calculation',
			[
				['of', 'Quanto é X% de Y?', 'What is X% of Y?'],
				['change', 'Variação percentual de X para Y', 'Percentage change from X to Y'],
				['ratio', 'X representa quantos % de Y?', 'What percent of Y is X?'],
			],
			undefined,
			'tools.percentage',
		),
		number(
			'first',
			'X / percentual',
			'X / percentage',
			10,
			-1_000_000_000,
			1_000_000_000,
			'any',
			'tools.percentage',
		),
		number(
			'second',
			'Y / valor base',
			'Y / base value',
			200,
			-1_000_000_000,
			1_000_000_000,
			'any',
			'tools.percentage',
		),
	],
	(v) => {
		const first = Number(field(v, 'first'));
		const second = Number(field(v, 'second'));
		const operation = field(v, 'operation');
		if (operation === 'of') {
			return result({ value: (first / 100) * second });
		}
		if (operation === 'change' && first === 0) {
			throw new Error('O valor inicial não pode ser zero / The initial value cannot be zero');
		}
		if (second === 0) {
			throw new Error('Y não pode ser zero / Y cannot be zero');
		}
		return result({
			value:
				operation === 'change'
					? ((second - first) / Math.abs(first)) * 100
					: (first / second) * 100,
			unit: '%',
		});
	},
);
