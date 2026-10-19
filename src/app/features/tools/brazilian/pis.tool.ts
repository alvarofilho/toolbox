import { validatePisPasep, PIS_PASEP_GOLDEN_PRIMARY } from '@br-validators/core/pis-pasep';

import { synthetic } from '@app/features/tools/_shared/controls';

import { tool, result } from '@app/features/tools/_shared/definition';

import { source } from '@app/features/tools/_shared/controls';

import { field } from '@app/core/models/tool';

export const definition = tool(
	'pis',
	[source],
	(v) => result(validatePisPasep(field(v, 'input'))),
	{ input: PIS_PASEP_GOLDEN_PRIMARY },
	synthetic,
);
