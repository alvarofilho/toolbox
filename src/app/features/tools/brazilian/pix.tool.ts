import {
	buildStaticPixBrCode,
	validateBrCode,
	BRCODE_GOLDEN_STATIC_EMAIL,
} from '@br-validators/core/brcode';

import { tool, result } from '@app/features/tools/_shared/definition';

import { source, input } from '@app/features/tools/_shared/controls';

import { mode } from '@app/features/tools/_shared/execution-controls';

import { field } from '@app/core/models/tool';

export const definition = tool(
	'pix',
	[
		source,
		mode(['decode', 'generate']),
		input('key', 'tools.pix.pix_key', 'teste@example.com', 'text'),
		input('name', 'tools.pix.merchant_name', 'DADOS DE TESTE', 'text'),
		input('city', 'tools.pix.city', 'SAO PAULO', 'text'),
		input('amount', 'tools.pix.amount_optional_decimal_point', '', 'text'),
		input('txid', 'tools.pix.transaction_id', '***', 'text'),
	],
	(v) => {
		if (field(v, 'mode') === 'decode') {
			return result(validateBrCode(field(v, 'input')));
		}
		const payload = buildStaticPixBrCode({
			pixKey: field(v, 'key'),
			merchantName: field(v, 'name'),
			merchantCity: field(v, 'city'),
			amount: field(v, 'amount') || undefined,
			txid: field(v, 'txid'),
		});
		const validation = validateBrCode(payload);
		if (!validation.ok) {
			throw new Error(JSON.stringify(validation));
		}
		return result({ payload, validation });
	},
	{ input: BRCODE_GOLDEN_STATIC_EMAIL },
	'tools.pix.generates_or_inspects_a_static_pix_payload',
);
