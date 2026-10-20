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
	],
	action: generate,
	run: (v) => ({
		output: password(
			boundedNumber(field(v, 'length'), 8, 256),
			Object.entries(sets)
				.filter(([key]) => field(v, key) === 'true')
				.map(([, value]) => value),
		),
	}),
};
