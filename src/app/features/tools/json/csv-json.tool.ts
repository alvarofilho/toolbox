import Papa from 'papaparse';

import { tool, result } from '@app/features/tools/_shared/definition';

import { source } from '@app/features/tools/_shared/controls';

import { field } from '@app/core/models/tool';

export const definition = tool(
	'csv-json',
	[source],
	(v) => {
		const parsed = Papa.parse<Record<string, string>>(field(v, 'input'), {
			header: true,
			skipEmptyLines: true,
		});
		if (parsed.errors.length) {
			throw new Error(parsed.errors.map((e) => e.message).join('\n'));
		}
		return result(parsed.data);
	},
	{ input: 'id,name\n1,Ana\n2,Bruno' },
);
