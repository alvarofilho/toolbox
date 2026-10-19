import { tool, result } from '@app/features/tools/_shared/definition';

import { source } from '@app/features/tools/_shared/controls';

import { field } from '@app/core/models/tool';

import { json } from '@app/features/tools/_shared/data';

import { rowsFrom, sqlInsert } from '@app/features/tools/json/data-utils';

import { table } from '@app/features/tools/database/sql-controls';

export const definition = tool(
	'sql-insert',
	[source, table],
	(v) => result(sqlInsert(rowsFrom(json(field(v, 'input'))), field(v, 'table')), 'inserts.sql'),
	{ input: '[{"id":1,"name":"Ana"},{"id":2,"name":"Bruno"}]' },
);
