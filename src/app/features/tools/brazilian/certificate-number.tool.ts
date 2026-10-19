import { synthetic } from '@app/features/tools/_shared/controls';

import { tool, result } from '@app/features/tools/_shared/definition';

import { field, boundedNumber } from '@app/core/models/tool';

import { number } from '@app/features/tools/_shared/controls';

import { digits } from '@app/features/tools/brazilian/test-numbers';

export const definition = tool(
	'certificate-number',
	[number('count', 'Quantidade', 'Count', 5, 1, 100)],
	(v) =>
		result(
			Array.from({ length: boundedNumber(field(v, 'count'), 1, 100) }, () => ({
				recordNumber: `${digits(6)}.${digits(2)}.${digits(4)}.${digits(2)}.${digits(2)}.${digits(4)}.${digits(2)}.${digits(6)}`,
				validation: 'format-only; not registered in a civil registry',
			})),
			'certificate-test-data.json',
		),
	undefined,
	synthetic,
);
