import 'reflect-metadata';

import { fromBER } from 'asn1js';

import { ContentInfo, SignedData } from 'pkijs';

import { tool, result } from '@app/features/tools/_shared/definition';

import { source } from '@app/features/tools/_shared/controls';

import { field } from '@app/core/models/tool';

import { base64Bytes } from '@app/features/tools/_shared/bytes';

import { decodeHint } from '@app/features/tools/security/decoding-hint';

export const definition = tool(
	'p7b-explorer',
	[source],
	(v) => {
		const value = field(v, 'input').trim();
		const base64Value = value.replace(/-----BEGIN PKCS7-----|-----END PKCS7-----|\s/g, '');
		const bytes = base64Bytes(base64Value);
		const parsed = fromBER(bytes.buffer);
		if (parsed.offset === -1 || parsed.offset !== bytes.length) {
			throw new Error('Pacote PKCS#7 inválido / Invalid PKCS#7 bundle');
		}
		const contentInfo = new ContentInfo({ schema: parsed.result });
		if (contentInfo.contentType !== ContentInfo.SIGNED_DATA) {
			throw new Error('Esperado PKCS#7 SignedData / Expected PKCS#7 SignedData');
		}
		const signedData = new SignedData({ schema: contentInfo.content });
		return result({
			contentType: contentInfo.contentType,
			certificateCount: signedData.certificates?.length ?? 0,
			signerCount: signedData.signerInfos.length,
			signed: signedData.signerInfos.length > 0,
			certificates: signedData.certificates?.map((certificate) => certificate.toJSON()) ?? [],
		});
	},
	undefined,
	decodeHint,
);
