import Papa from 'papaparse';

import { synthetic } from '@app/features/tools/_shared/controls';

import { tool, result } from '@app/features/tools/_shared/definition';

import { input, select } from '@app/features/tools/_shared/controls';

import { count } from '@app/features/tools/_shared/execution-controls';

import { field, boundedNumber } from '@app/core/models/tool';

import { sqlInsert } from '@app/features/tools/json/data-utils';

export const format = select('format', 'common.format', [
	['json', 'common.json'],
	['csv', 'common.csv'],
	['sql', 'common.sql_insert'],
]);

export function records(
	id: string,
	factory: (v: Readonly<Record<string, string>>, i: number) => Record<string, unknown>,
	extras = [] as ReturnType<typeof input>[],
) {
	return tool(
		id,
		[count, format, ...extras],
		(v) => {
			const rows = Array.from({ length: boundedNumber(field(v, 'count'), 1, 1000) }, (_, i) => ({
				synthetic: true,
				...factory(v, i),
			}));
			const f = field(v, 'format');
			return result(
				f === 'csv'
					? Papa.unparse(rows, { escapeFormulae: true })
					: f === 'sql'
						? sqlInsert(rows, 'synthetic_data')
						: rows,
				`synthetic-${id}.${f}`,
			);
		},
		undefined,
		synthetic,
	);
}
