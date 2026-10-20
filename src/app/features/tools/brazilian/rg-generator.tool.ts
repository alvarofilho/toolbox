import { tool, result } from '@app/features/tools/_shared/definition';

import { field, boundedNumber } from '@app/core/models/tool';

import { number } from '@app/features/tools/_shared/controls';

import { digits } from '@app/features/tools/brazilian/test-numbers';

export const definition = tool(
	'rg-generator',
	[number('count', 'tools.rg-generator.count', 5, 1, 100, undefined)],
	(v) => {
		const count = boundedNumber(field(v, 'count'), 1, 100);
		return result(
			Array.from({ length: count }, () => ({
				value: digits(9),
				validation: 'format-only; RG rules vary by state and issuer',
			})),
			'rg-test-data.json',
		);
	},
	undefined,
	'tools.rg-generator.rg_does_not_have_one_nationwide_validation',
);
