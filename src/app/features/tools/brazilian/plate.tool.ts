import { randomInt } from '@app/features/tools/_shared/random';

import { synthetic } from '@app/features/tools/_shared/controls';

import { tool, result } from '@app/features/tools/_shared/definition';

import { source } from '@app/features/tools/_shared/controls';

import { mode } from '@app/features/tools/_shared/execution-controls';

import { field } from '@app/core/models/tool';

import { digits } from '@app/features/tools/brazilian/test-numbers';

export const definition = tool(
	'plate',
	[mode(['generate', 'validate']), source],
	(v) => {
		if (field(v, 'mode') === 'generate') {
			const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
			const legacy = `${Array.from({ length: 3 }, () => letters[randomInt(letters.length)]).join('')}${digits(4)}`;
			const mercosul = `${legacy.slice(0, 3)}${digits(1)}${letters[randomInt(letters.length)]}${digits(2)}`;
			return result({ legacy, mercosul, validation: 'format-only' });
		}
		const value = field(v, 'input')
			.toUpperCase()
			.replace(/[^A-Z0-9]/g, '');
		return result({
			value,
			validFormat: /^[A-Z]{3}\d{4}$/.test(value) || /^[A-Z]{3}\d[A-Z]\d{2}$/.test(value),
			validation: 'format-only',
		});
	},
	undefined,
	synthetic,
);
