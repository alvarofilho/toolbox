import { compare } from 'fast-json-patch';

import { tool, result } from '@app/features/tools/_shared/definition';

import { source } from '@app/features/tools/_shared/controls';

import { second } from '@app/features/tools/_shared/execution-controls';

import { field } from '@app/core/models/tool';

import { parseDdl, ddlExample } from '@app/features/tools/database/ddl';

export const definition = tool(
	'sql-schema-diff',
	[source, second],
	(v) =>
		result(
			compare({ tables: parseDdl(field(v, 'input')) }, { tables: parseDdl(field(v, 'second')) }),
			'schema-diff.json',
		),
	{
		input: ddlExample.input,
		second: ddlExample.input.replace('name VARCHAR(255)', 'name VARCHAR(100)'),
	},
	'tools.sql-schema-diff.compares_postgresql_create_table_asts_outp',
);
