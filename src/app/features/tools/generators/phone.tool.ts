import { randomInt } from '@app/features/tools/_shared/random';

import { input } from '@app/features/tools/_shared/controls';

import { field } from '@app/core/models/tool';

import { records } from '@app/features/tools/generators/record-generation';

const ddd = input('ddd', 'DDD', 'Area code', '11', 'text');

export const definition = records(
	'phone',
	(v) => {
		if (!/^[1-9]\d$/.test(field(v, 'ddd'))) {
			throw new Error('DDD: 2 dígitos / 2 digits');
		}
		return { phone: `(${field(v, 'ddd')}) 9${String(randomInt(100000000)).padStart(8, '0')}` };
	},
	[ddd],
);
