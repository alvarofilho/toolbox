import {
	buildStaticPixBrCode,
	validateBrCode,
	BRCODE_GOLDEN_STATIC_EMAIL,
} from '@br-validators/core/brcode';

import { tool, result } from '@app/features/tools/_shared/definition';

import { source, input } from '@app/features/tools/_shared/controls';

import { mode } from '@app/features/tools/_shared/execution-controls';

import { field, text } from '@app/core/models/tool';

export const definition = tool(
	'pix',
	[
		source,
		mode(['decode', 'generate']),
		input('key', 'Chave PIX', 'PIX key', 'teste@example.com', 'text', 'tools.pix'),
		input('name', 'Nome do recebedor', 'Merchant name', 'DADOS DE TESTE', 'text', 'tools.pix'),
		input('city', 'Cidade', 'City', 'SAO PAULO', 'text', 'tools.pix'),
		input(
			'amount',
			'Valor (opcional; ponto decimal)',
			'Amount (optional; decimal point)',
			'',
			'text',
			'tools.pix',
		),
		input('txid', 'Identificador (TXID)', 'Transaction ID', '***', 'text', 'tools.pix'),
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
	text(
		'Gera ou inspeciona um payload PIX estático e seu CRC. Não consulta a chave nem confirma titularidade ou pagamento.',
		'Generates or inspects a static PIX payload and CRC. Does not look up keys or confirm ownership or payment.',
		undefined,
		'tools.pix',
	),
);
