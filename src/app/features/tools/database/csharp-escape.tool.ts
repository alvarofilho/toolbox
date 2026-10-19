import { tool, result } from '@app/features/tools/_shared/definition';

import { source } from '@app/features/tools/_shared/controls';

import { mode } from '@app/features/tools/_shared/execution-controls';

import { field } from '@app/core/models/tool';

export const definition = tool(
	'csharp-escape',
	[source, mode(['regular', 'verbatim'])],
	(v) =>
		result(
			field(v, 'mode') === 'verbatim'
				? `@"${field(v, 'input').replace(/"/g, '""')}"`
				: JSON.stringify(field(v, 'input')),
			'literal.cs',
		),
	{ input: 'C:\\Users\\Test\n"Hello"' },
);
