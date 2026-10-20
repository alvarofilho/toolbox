import { randomInt } from '@app/features/tools/_shared/random';

import { synthetic } from '@app/features/tools/_shared/controls';

import { tool, result } from '@app/features/tools/_shared/definition';

import { select, number } from '@app/features/tools/_shared/controls';

import { field, boundedNumber } from '@app/core/models/tool';

import { digits } from '@app/features/tools/brazilian/test-numbers';

export const definition = tool(
	'bank-account',
	[
		select(
			'bank',
			'tools.bank-account.bank',
			[
				['001', 'tools.bank-account.banco_do_brasil'],
				['033', 'tools.bank-account.santander'],
				['104', 'tools.bank-account.caixa'],
				['237', 'tools.bank-account.bradesco'],
				['341', 'tools.bank-account.itau'],
			],
			undefined,
		),
		number('count', 'tools.bank-account.count', 5, 1, 100, undefined),
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
