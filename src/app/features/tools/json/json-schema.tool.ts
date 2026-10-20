import { tool, result } from '@app/features/tools/_shared/definition';

import { source, input } from '@app/features/tools/_shared/controls';

import { field } from '@app/core/models/tool';

import { runDataTask as task } from '@app/features/tools/json/data-runner';

export const definition = tool(
	'json-schema',
	[source, input('schema', 'tools.json-schema.json_schema_draft_7', undefined, undefined)],
	async (v) => result(await task('schema', field(v, 'input'), field(v, 'schema'))),
	{
		input: '{"name":"Ana"}',
		schema: '{"type":"object","properties":{"name":{"type":"string"}},"required":["name"]}',
	},
);
