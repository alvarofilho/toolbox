import { parse, print } from 'graphql';

import { tool, result } from '@app/features/tools/_shared/definition';

import { source } from '@app/features/tools/_shared/controls';

import { field } from '@app/core/models/tool';

export const definition = tool(
	'graphql',
	[source],
	(v) => result(print(parse(field(v, 'input'))), 'query.graphql'),
	{
		input: 'query Users($id:ID!){user(id:$id){id name email}}',
	},
);
