import { field } from '@app/core/models/tool';

import { number, select } from '@app/features/tools/_shared/controls';

import { result, tool } from '@app/features/tools/_shared/definition';

export const definition = tool(
	'percentage',
	[
		select(
			'operation',
			'tools.percentage.calculation',
			[
				['of', 'tools.percentage.what_is_x_of_y'],
				['change', 'tools.percentage.percentage_change_from_x_to_y'],
				['ratio', 'tools.percentage.what_percent_of_y_is_x'],
			],
			undefined,
		),
		number('first', 'tools.percentage.x_percentage', 10, -1_000_000_000, 1_000_000_000, 'any'),
		number('second', 'tools.percentage.y_base_value', 200, -1_000_000_000, 1_000_000_000, 'any'),
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
