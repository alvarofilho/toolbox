import {
	validateInscricaoEstadual,
	IE_SUPPORTED_UFS,
} from '@br-validators/core/inscricao-estadual';

import { randomInt } from '@app/features/tools/_shared/random';

import { synthetic } from '@app/features/tools/_shared/controls';

import { tool, result } from '@app/features/tools/_shared/definition';

import { field, boundedNumber } from '@app/core/models/tool';

import { number } from '@app/features/tools/_shared/controls';

import { uf } from '@app/features/tools/brazilian/document-controls';

import { digits } from '@app/features/tools/brazilian/test-numbers';

export const definition = tool(
	'ie-generator',
	[uf, number('count', 'tools.ie-generator.count', 1, 1, 10, undefined)],
	(v) => {
		const state = IE_SUPPORTED_UFS.find((s) => s === field(v, 'uf'));
		if (!state) {
			throw new Error('UF inválida / Invalid state');
		}
		const count = boundedNumber(field(v, 'count'), 1, 10);
		const values = Array.from({ length: count }, () => {
			for (let attempt = 0; attempt < 2000; attempt++) {
				const candidate = digits(8 + randomInt(7));
				if (validateInscricaoEstadual(candidate, { uf: state }).ok) {
					return candidate;
				}
			}
			throw new Error(
				`Não foi possível gerar IE para ${state} / Could not generate state registration`,
			);
		});
		return result(values, 'inscricoes-estaduais-test.txt');
	},
	undefined,
	synthetic,
);
