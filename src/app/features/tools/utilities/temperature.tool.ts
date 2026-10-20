import { field } from '@app/core/models/tool';

import { number, select } from '@app/features/tools/_shared/controls';

import { result, tool } from '@app/features/tools/_shared/definition';

export const definition = tool(
	'temperature',
	[
		number('value', 'tools.temperature.temperature', 0, -1_000_000, 1_000_000, 'any'),
		select(
			'from',
			'tools.temperature.from',
			[
				['C', 'tools.temperature.celsius'],
				['F', 'tools.temperature.fahrenheit'],
				['K', 'tools.temperature.kelvin'],
			],
			undefined,
		),
		select(
			'to',
			'tools.temperature.to_title',
			[
				['F', 'tools.temperature.fahrenheit'],
				['C', 'tools.temperature.celsius'],
				['K', 'tools.temperature.kelvin'],
			],
			undefined,
		),
	],
	(v) => {
		const value = Number(field(v, 'value'));
		const from = field(v, 'from');
		const to = field(v, 'to');
		if (from === 'K' && value < 0) {
			throw new Error('Temperatura abaixo do zero absoluto / Temperature below absolute zero');
		}
		const celsius = from === 'C' ? value : from === 'F' ? ((value - 32) * 5) / 9 : value - 273.15;
		const converted = to === 'C' ? celsius : to === 'F' ? (celsius * 9) / 5 + 32 : celsius + 273.15;
		if (to === 'K' && converted < 0) {
			throw new Error('Temperatura abaixo do zero absoluto / Temperature below absolute zero');
		}
		return result({ value: converted, unit: to });
	},
);
