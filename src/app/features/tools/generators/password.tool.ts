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
		number('length', 'Comprimento', 'Length', 24, 8, 256, undefined, 'tools.password'),
		check('upper', 'Maiúsculas', 'Uppercase', undefined, 'tools.password'),
		check('lower', 'Minúsculas', 'Lowercase', undefined, 'tools.password'),
		check('digits', 'Números', 'Numbers', undefined, 'tools.password'),
		check('symbols', 'Símbolos', 'Symbols', undefined, 'tools.password'),
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
