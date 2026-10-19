import { synthetic } from '@app/features/tools/_shared/controls';

import { tool, result } from '@app/features/tools/_shared/definition';

import { source } from '@app/features/tools/_shared/controls';

import { mode } from '@app/features/tools/_shared/execution-controls';

import { field } from '@app/core/models/tool';

import { digits } from '@app/features/tools/brazilian/test-numbers';

function validRenavam(value: string): boolean {
	const clean = value.replace(/\D/g, '');
	if (!/^\d{11}$/.test(clean) || /^(.)\1+$/.test(clean)) {
		return false;
	}
	let sum = 0;
	let weight = 2;
	for (let index = 9; index >= 0; index--) {
		sum += Number(clean[index]) * weight;
		weight = weight === 9 ? 2 : weight + 1;
	}
	const remainder = sum % 11;
	const checkDigit = remainder < 2 ? 0 : 11 - remainder;
	return checkDigit === Number(clean[10]);
}

function makeRenavam(): string {
	const base = digits(10);
	for (let check = 0; check < 10; check++) {
		const candidate = `${base}${check}`;
		if (validRenavam(candidate)) {
			return candidate;
		}
	}
	throw new Error('Falha ao calcular RENAVAM / RENAVAM calculation failed');
}

export const definition = tool(
	'renavam',
	[mode(['generate', 'validate']), source],
	(v) => {
		if (field(v, 'mode') === 'generate') {
			return result({ value: makeRenavam(), validation: 'check-digit' });
		}
		return result({
			value: field(v, 'input'),
			valid: validRenavam(field(v, 'input')),
			scope: 'mathematical check only; no vehicle registry lookup',
		});
	},
	undefined,
	synthetic,
);
