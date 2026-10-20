import { field, boundedNumber, type ToolDefinition } from '@app/core/models/tool';
import { password } from '@app/features/tools/_shared/random';
import { number, check, generate } from '@app/features/tools/_shared/controls';

const sets = {
	upper: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
	lower: 'abcdefghijklmnopqrstuvwxyz',
	digits: '0123456789',
	symbols: '!@#$%^&*()-_=+[]{}:,.?',
};
export const definition: ToolDefinition = {
	id: 'password',
	controls: [
		number('length', 'tools.password.length', 24, 8, 256, undefined),
		check('upper', 'tools.password.uppercase_title', undefined),
		check('lower', 'tools.password.lowercase_title', undefined),
		check('digits', 'tools.password.numbers', undefined),
		check('symbols', 'tools.password.symbols', undefined),
		{
			...number('minNumbers', 'tools.password.minimum_numbers', 1, 0, 256),
			when: { key: 'digits', values: ['true'] },
		},
		{
			...number('minSymbols', 'tools.password.minimum_symbols', 1, 0, 256),
			when: { key: 'symbols', values: ['true'] },
		},
		check('avoidAmbiguous', 'tools.password.avoid_ambiguous', true),
	],
	action: generate,
	run: (v) => {
		const length = boundedNumber(field(v, 'length'), 8, 256);
		const selected = Object.entries(sets).filter(([key]) => field(v, key) === 'true');
		const minimumNumbers = selected.some(([key]) => key === 'digits')
			? boundedNumber(field(v, 'minNumbers'), 0, 256)
			: 0;
		const minimumSymbols = selected.some(([key]) => key === 'symbols')
			? boundedNumber(field(v, 'minSymbols'), 0, 256)
			: 0;

		return {
			output: password(
				length,
				selected.map(([, value]) => value),
				{
					minimums: selected.map(([key]) =>
						key === 'digits' ? minimumNumbers : key === 'symbols' ? minimumSymbols : 1,
					),
					avoidAmbiguous: field(v, 'avoidAmbiguous') === 'true',
				},
			),
		};
	},
};
