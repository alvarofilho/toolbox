import 'reflect-metadata';

import { fromBER } from 'asn1js';

import { TimeStampResp } from 'pkijs';

import { tool, result } from '@app/features/tools/_shared/definition';

import { source } from '@app/features/tools/_shared/controls';

import { field, text } from '@app/core/models/tool';

import { base64Bytes } from '@app/features/tools/_shared/bytes';

export const definition = tool(
	'tsr-decoder',
	[source],
	(v) => {
		const value = field(v, 'input').trim();
		const base64Value = value.replace(/-----BEGIN TS[PR]-----|-----END TS[PR]-----|\s/g, '');
		const bytes = base64Bytes(base64Value);
		const parsed = fromBER(bytes.buffer);
		if (parsed.offset === -1 || parsed.offset !== bytes.length) {
			throw new Error('Resposta TSR inválida / Invalid TSR response');
		}
		const response = new TimeStampResp({ schema: parsed.result });
		return result({
			status: response.status.status,
			statusInfo: response.status.toJSON(),
			hasTimeStampToken: !!response.timeStampToken,
			tokenContentType: response.timeStampToken?.contentType ?? null,
		});
	},
	undefined,
	text(
		'Mostra o status e a estrutura da resposta. Não valida cadeia de confiança, assinatura ou política da TSA.',
		'Shows the response status and structure. It does not validate TSA trust, signature, or policy.',
	),
);
