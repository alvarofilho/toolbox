import {
	validateNfeChave,
	computeNfeChaveCheckDigit,
	NFE_CHAVE_GOLDEN_PRIMARY,
} from '@br-validators/core/nfe-chave';

import { generateDocument } from '@app/features/tools/brazilian/documents';

import { randomInt } from '@app/features/tools/_shared/random';

import { synthetic } from '@app/features/tools/_shared/controls';

import { tool, result } from '@app/features/tools/_shared/definition';

import { source } from '@app/features/tools/_shared/controls';

import { mode } from '@app/features/tools/_shared/execution-controls';

import { field } from '@app/core/models/tool';

export const definition = tool(
	'nfe',
	[source, mode(['validate', 'generate'])],
	(v) => {
		if (field(v, 'mode') === 'validate') {
			return result(validateNfeChave(field(v, 'input')));
		}
		const base =
			field(v, 'input').replace(/\s/g, '') ||
			`352601${generateDocument('cnpj').replace(/\D/g, '')}55001${String(randomInt(999999999) + 1).padStart(9, '0')}1${String(randomInt(100000000)).padStart(8, '0')}`;
		if (!/^\d{43}$/.test(base)) {
			throw new Error(
				'Para gerar, deixe vazio ou informe os 43 dígitos sem DV / For generation leave empty or enter 43 digits without check digit',
			);
		}
		const key = base + String(computeNfeChaveCheckDigit(base));
		const validation = validateNfeChave(key);
		if (!validation.ok) {
			throw new Error(JSON.stringify(validation));
		}
		return result({ synthetic: true, key, validation });
	},
	{ input: NFE_CHAVE_GOLDEN_PRIMARY, mode: 'validate' },
	synthetic,
);
