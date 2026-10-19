import { tool, result } from '@app/features/tools/_shared/definition';

import { field, text, boundedNumber } from '@app/core/models/tool';

import { number } from '@app/features/tools/_shared/controls';

import { digits } from '@app/features/tools/brazilian/test-numbers';

export const definition = tool(
	'rg-generator',
	[number('count', 'Quantidade', 'Count', 5, 1, 100, undefined, 'tools.rg-generator')],
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
	text(
		'RG não possui um único algoritmo nacional de validação; os valores são fictícios e apenas formatados.',
		'RG does not have one nationwide validation algorithm; values are fictional and format-only.',
		undefined,
		'tools.rg-generator',
	),
);
