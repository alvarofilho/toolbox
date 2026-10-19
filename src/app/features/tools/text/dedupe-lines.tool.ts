import { tool, result } from '@app/features/tools/_shared/definition';

import { source } from '@app/features/tools/_shared/controls';

import { mode } from '@app/features/tools/_shared/execution-controls';

import { field } from '@app/core/models/tool';

export const definition = tool(
	'dedupe-lines',
	[source, mode(['exact', 'trim', 'ignore-case'])],
	(v) => {
		const seen = new Set<string>();
		return result(
			field(v, 'input')
				.split(/\r?\n/)
				.filter((line) => {
					const m = field(v, 'mode'),
						key =
							m === 'trim' ? line.trim() : m === 'ignore-case' ? line.toLocaleLowerCase() : line;
					if (seen.has(key)) {
						return false;
					}
					seen.add(key);
					return true;
				})
				.join('\n'),
			'unique.txt',
		);
	},
	{ input: 'Ana\nBruno\nAna\nCamila' },
);
