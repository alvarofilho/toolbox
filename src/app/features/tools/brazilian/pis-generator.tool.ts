import { validatePisPasep } from '@br-validators/core/pis-pasep';

import { synthetic } from '@app/features/tools/_shared/controls';

import { tool, result } from '@app/features/tools/_shared/definition';

import { field, boundedNumber } from '@app/core/models/tool';

import { number } from '@app/features/tools/_shared/controls';

import { generateByValidation } from '@app/features/tools/brazilian/test-numbers';

export const definition = tool(
	'pis-generator',
	[number('count', 'Quantidade', 'Count', 5, 1, 100, undefined, 'tools.pis-generator')],
	(v) => {
		const count = boundedNumber(field(v, 'count'), 1, 100);
		return result(
			Array.from({ length: count }, () => generateByValidation(11, validatePisPasep)),
			'pis-test-data.txt',
		);
	},
	undefined,
	synthetic,
);
