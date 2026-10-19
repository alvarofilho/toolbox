import Papa from 'papaparse';

import { tool, result } from '@app/features/tools/_shared/definition';

import { source, select } from '@app/features/tools/_shared/controls';

import { field } from '@app/core/models/tool';

export const definition = tool(
	'csv-cleaner',
	[
		source,
		select('delimiter', 'Delimitador de saída', 'Output delimiter', [
			[',', 'Vírgula', 'Comma'],
			[';', 'Ponto e vírgula', 'Semicolon'],
			['\t', 'Tab', 'Tab'],
		]),
	],
	(v) => {
		const parsed = Papa.parse<string[]>(field(v, 'input'), { skipEmptyLines: 'greedy' });
		if (parsed.errors.length) {
			throw new Error(parsed.errors.map((e) => e.message).join('\n'));
		}
		const rows = parsed.data.map((row) => row.map((s) => s.trim()));
		const seen = new Set<string>(),
			dedup = rows.filter((row) => {
				const key = JSON.stringify(row);
				if (seen.has(key)) {
					return false;
				}
				seen.add(key);
				return true;
			});
		return result(
			Papa.unparse(dedup, { delimiter: field(v, 'delimiter'), escapeFormulae: true }),
			'clean.csv',
		);
	},
	{ input: 'name,city\n Ana , São Paulo \nBruno,Rio\n Ana , São Paulo \n\n' },
);
