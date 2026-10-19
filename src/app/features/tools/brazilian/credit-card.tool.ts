import { randomInt } from '@app/features/tools/_shared/random';

import { synthetic } from '@app/features/tools/_shared/controls';

import { tool, result } from '@app/features/tools/_shared/definition';

import { source } from '@app/features/tools/_shared/controls';

import { mode } from '@app/features/tools/_shared/execution-controls';

import { field } from '@app/core/models/tool';

import { digits } from '@app/features/tools/brazilian/test-numbers';

function luhnValid(value: string): boolean {
	const digitsOnly = value.replace(/\D/g, '');
	if (!/^\d{13,19}$/.test(digitsOnly)) {
		return false;
	}
	let sum = 0;
	let double = false;
	for (let index = digitsOnly.length - 1; index >= 0; index--) {
		let digit = Number(digitsOnly[index]);
		if (double) {
			digit *= 2;
			if (digit > 9) {
				digit -= 9;
			}
		}
		sum += digit;
		double = !double;
	}
	return sum % 10 === 0;
}

export const definition = tool(
	'credit-card',
	[mode(['generate', 'validate']), source],
	(v) => {
		if (field(v, 'mode') === 'validate') {
			const value = field(v, 'input');
			return result({
				value,
				validLuhn: luhnValid(value),
				scope: 'checksum only; not an issued card or payment credential',
			});
		}
		const stem = `${['4', '5'][randomInt(2)]}${digits(14)}`;
		const value = Array.from({ length: 10 }, (_, digit) => `${stem}${digit}`).find(luhnValid);
		if (!value) {
			throw new Error('Falha ao gerar cartão de teste / Could not generate test card');
		}
		return result({ value, validLuhn: true, synthetic: true });
	},
	undefined,
	synthetic,
);
