import { tool, result } from '@app/features/tools/_shared/definition';

import { source } from '@app/features/tools/_shared/controls';

import { field } from '@app/core/models/tool';

import { json } from '@app/features/tools/_shared/data';

export const definition = tool(
	'json-validator',
	[source],
	(v) => {
		json(field(v, 'input'));
		return result({ valid: true });
	},
	{ input: '{"valid":true}' },
);
