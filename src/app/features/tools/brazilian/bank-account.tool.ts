import { randomInt } from '@app/features/tools/_shared/random';

import { synthetic } from '@app/features/tools/_shared/controls';

import { tool, result } from '@app/features/tools/_shared/definition';

import { select, number } from '@app/features/tools/_shared/controls';

import { field, boundedNumber } from '@app/core/models/tool';

import { digits } from '@app/features/tools/brazilian/test-numbers';

export const definition = tool(
	'bank-account',
	[
		select('bank', 'Banco', 'Bank', [
			['001', 'Banco do Brasil', 'Banco do Brasil'],
			['033', 'Santander', 'Santander'],
			['104', 'Caixa', 'Caixa'],
			['237', 'Bradesco', 'Bradesco'],
			['341', 'Itaú', 'Itaú'],
		]),
		number('count', 'Quantidade', 'Count', 5, 1, 100),
	],
	(v) => {
		const count = boundedNumber(field(v, 'count'), 1, 100);
		return result(
			Array.from({ length: count }, () => ({
				bankCode: field(v, 'bank'),
				branch: digits(4),
				account: `${digits(8)}-${randomInt(10)}`,
				validation: 'synthetic format; bank-specific check digit not validated',
			})),
			'bank-accounts-test.json',
		);
	},
	undefined,
	synthetic,
);
