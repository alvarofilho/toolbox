import { validateCnh, CNH_GOLDEN_PRIMARY } from '@br-validators/core/cnh';

import { synthetic } from '@app/features/tools/_shared/controls';

import { tool, result } from '@app/features/tools/_shared/definition';

import { source } from '@app/features/tools/_shared/controls';

import { field } from '@app/core/models/tool';

export const definition = tool(
	'cnh',
	[source],
	(v) => result(validateCnh(field(v, 'input'))),
	{ input: CNH_GOLDEN_PRIMARY },
	synthetic,
);
