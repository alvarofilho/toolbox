import { compare } from 'fast-json-patch';

import { tool, result } from '@app/features/tools/_shared/definition';

import { source } from '@app/features/tools/_shared/controls';

import { second } from '@app/features/tools/_shared/execution-controls';

import { field } from '@app/core/models/tool';

import { json, object } from '@app/features/tools/_shared/data';

export const definition = tool(
	'json-patch',
	[source, second],
	(v) =>
		result(
			compare(object(json(field(v, 'input'))), object(json(field(v, 'second')))),
			'patch.json',
		),
	{ input: '{"name":"Ana","active":false}', second: '{"name":"Ana","active":true,"age":25}' },
);
