import { tool, result } from '@app/features/tools/_shared/definition';

import { source } from '@app/features/tools/_shared/controls';

import { field } from '@app/core/models/tool';

import { runDataTask as task } from '@app/features/tools/json/data-runner';

export const definition = tool(
	'schema-faker',
	[source],
	async (v, _files, signal) =>
		result(await task('faker', field(v, 'input'), '', signal), 'synthetic.json'),
	{
		input:
			'{"type":"object","properties":{"id":{"type":"integer","minimum":1,"maximum":100},"name":{"type":"string","minLength":3,"maxLength":12}},"required":["id","name"]}',
	},
);
