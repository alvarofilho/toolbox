import { tool, result } from '@app/features/tools/_shared/definition';

import { source, input } from '@app/features/tools/_shared/controls';

import { field } from '@app/core/models/tool';

import { json } from '@app/features/tools/_shared/data';

import { rowsFrom, sqlInsert } from '@app/features/tools/json/data-utils';

import { sample } from '@app/features/tools/json/sample-data';

export const definition = tool(
	'json-sql',
	[source, input('table', 'tools.json-sql.table', 'data', 'text')],
	(v) => result(sqlInsert(rowsFrom(json(field(v, 'input'))), field(v, 'table')), 'data.sql'),
	sample,
);
