import { tool, result } from '@app/features/tools/_shared/definition';

import { source } from '@app/features/tools/_shared/controls';

import { field } from '@app/core/models/tool';

import { json } from '@app/features/tools/_shared/data';

import { generateTypes } from '@app/features/tools/json/type-generation';

export const definition = tool(
	'json-csharp',
	[source],
	(v) => result(generateTypes(json(field(v, 'input')), 'class'), 'Models.cs'),
	{ input: '{"id":1,"name":"Ana","active":true,"address":{"city":"São Paulo"}}' },
);
