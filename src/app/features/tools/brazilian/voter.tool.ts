import {
	validateTituloEleitor,
	TITULO_ELEITOR_GOLDEN_PRIMARY,
} from '@br-validators/core/titulo-eleitor';

import { synthetic } from '@app/features/tools/_shared/controls';

import { tool, result } from '@app/features/tools/_shared/definition';

import { source } from '@app/features/tools/_shared/controls';

import { field } from '@app/core/models/tool';

export const definition = tool(
	'voter',
	[source],
	(v) => result(validateTituloEleitor(field(v, 'input'))),
	{ input: TITULO_ELEITOR_GOLDEN_PRIMARY },
	synthetic,
);
