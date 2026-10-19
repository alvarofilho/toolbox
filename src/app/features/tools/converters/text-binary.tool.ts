import { tool, result } from '@app/features/tools/_shared/definition';

import { source } from '@app/features/tools/_shared/controls';

import { field } from '@app/core/models/tool';

import { utf8 } from '@app/features/tools/_shared/bytes';

export const definition = tool(
	'text-binary',
	[source],
	(v) =>
		result(
			Array.from(utf8(field(v, 'input')), (b) => b.toString(2).padStart(8, '0')).join(' '),
			'binary.txt',
		),
	{ input: 'Olá' },
);
