import { tool, result } from '@app/features/tools/_shared/definition';

import { source } from '@app/features/tools/_shared/controls';

import { field } from '@app/core/models/tool';

import { json } from '@app/features/tools/_shared/data';

import { generateTypes } from '@app/features/tools/json/type-generation';

import { sample } from '@app/features/tools/json/sample-data';

export const definition = tool(
	'json-csharp-interface',
	[source],
	(v) => result(generateTypes(json(field(v, 'input')), 'interface'), 'Interfaces.cs'),
	sample,
);
