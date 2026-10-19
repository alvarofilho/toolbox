import { ulid } from 'ulid';

import { tool, result } from '@app/features/tools/_shared/definition';

import { count } from '@app/features/tools/_shared/execution-controls';

import { field, boundedNumber } from '@app/core/models/tool';

export const definition = tool('ulid', [count], (v) =>
	result(
		Array.from({ length: boundedNumber(field(v, 'count'), 1, 1000) }, () => ulid()).join('\n'),
		'ulids.txt',
	),
);
