import { tool, result } from '@app/features/tools/_shared/definition';

import { source, input } from '@app/features/tools/_shared/controls';

import { field } from '@app/core/models/tool';

import { runDataTask as task } from '@app/features/tools/json/data-runner';

export const definition = tool(
	'jsonpath',
	[source, input('path', 'JSONPath', 'JSONPath', '$.items[*].name', 'text')],
	async (v) => result(await task('path', field(v, 'input'), field(v, 'path'))),
	{ input: '{"items":[{"name":"Ana"},{"name":"Bruno"}]}', path: '$.items[*].name' },
);
