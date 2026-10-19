import { tool, result } from '@app/features/tools/_shared/definition';

import { source } from '@app/features/tools/_shared/controls';

import { mode } from '@app/features/tools/_shared/execution-controls';

import { field } from '@app/core/models/tool';

export const definition = tool(
	'sort-lines',
	[source, mode(['ascending', 'descending', 'numeric'])],
	(v) => {
		const m = field(v, 'mode');
		return result(
			field(v, 'input')
				.split(/\r?\n/)
				.sort(
					(a, b) =>
						a.localeCompare(b, 'pt-BR', { numeric: m === 'numeric' }) *
						(m === 'descending' ? -1 : 1),
				)
				.join('\n'),
			'sorted.txt',
		);
	},
	{ input: 'item 10\nitem 2\nitem 1' },
);
