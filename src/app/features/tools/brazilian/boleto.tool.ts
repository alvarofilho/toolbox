import {
	validateBoleto,
	convertLinhaToCodigoBarras,
	convertCodigoBarrasToLinhaDigitavel,
	BOLETO_GOLDEN_LINHA_STRIPPED,
} from '@br-validators/core/boleto';

import { tool, result } from '@app/features/tools/_shared/definition';

import { source } from '@app/features/tools/_shared/controls';

import { mode } from '@app/features/tools/_shared/execution-controls';

import { field } from '@app/core/models/tool';

export const definition = tool(
	'boleto',
	[source, mode(['validate', 'barcode', 'line'])],
	(v) =>
		result(
			field(v, 'mode') === 'barcode'
				? convertLinhaToCodigoBarras(field(v, 'input'))
				: field(v, 'mode') === 'line'
					? convertCodigoBarrasToLinhaDigitavel(field(v, 'input'))
					: validateBoleto(field(v, 'input')),
		),
	{ input: BOLETO_GOLDEN_LINHA_STRIPPED },
	'tools.boleto.local_structural_validation_and_conversion',
);
