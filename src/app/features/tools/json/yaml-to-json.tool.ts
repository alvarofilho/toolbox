import { yamlToJson } from '@app/features/tools/json/json-yaml.tool';

import { tool, result } from '@app/features/tools/_shared/definition';

import { source } from '@app/features/tools/_shared/controls';

import { field } from '@app/core/models/tool';

export const definition = tool(
	'yaml-to-json',
	[source],
	(v) => result(yamlToJson(field(v, 'input'))),
	{
		input: 'name: Ana\nactive: true',
	},
);
