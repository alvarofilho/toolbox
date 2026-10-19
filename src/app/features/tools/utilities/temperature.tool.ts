import { field } from '@app/core/models/tool';

import { number, select } from '@app/features/tools/_shared/controls';

import { result, tool } from '@app/features/tools/_shared/definition';

export const definition = tool(
	'temperature',
	[
		number('value', 'Temperatura', 'Temperature', 0, -1_000_000, 1_000_000),
		select('from', 'De', 'From', [
			['C', 'Celsius', 'Celsius'],
			['F', 'Fahrenheit', 'Fahrenheit'],
			['K', 'Kelvin', 'Kelvin'],
		]),
		select('to', 'Para', 'To', [
			['F', 'Fahrenheit', 'Fahrenheit'],
			['C', 'Celsius', 'Celsius'],
			['K', 'Kelvin', 'Kelvin'],
		]),
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
