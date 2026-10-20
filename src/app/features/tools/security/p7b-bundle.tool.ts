import 'reflect-metadata';

import { fromBER } from 'asn1js';

import { Certificate, ContentInfo, EncapsulatedContentInfo, SignedData } from 'pkijs';

import { tool, result } from '@app/features/tools/_shared/definition';

import { source } from '@app/features/tools/_shared/controls';

import { field } from '@app/core/models/tool';

import { bytesBase64 } from '@app/features/tools/_shared/bytes';

import { pemBlocks } from '@app/features/tools/security/pem';

export const definition = tool(
	'p7b-bundle',
	[source],
	(v) => {
		const blocks = pemBlocks(field(v, 'input')).filter(({ label }) => label === 'CERTIFICATE');
		if (!blocks.length || blocks.length > 50) {
			throw new Error('Informe de 1 a 50 certificados PEM / Provide 1 to 50 PEM certificates');
		}
		const certificates = blocks.map(({ bytes }) => {
			const parsed = fromBER(bytes.buffer);
			if (parsed.offset === -1 || parsed.offset !== bytes.length) {
				throw new Error('Certificado PEM inválido / Invalid PEM certificate');
			}
			return new Certificate({ schema: parsed.result });
		});
		const signedData = new SignedData({
			version: 1,
			digestAlgorithms: [],
			encapContentInfo: new EncapsulatedContentInfo({ eContentType: ContentInfo.DATA }),
			certificates,
			signerInfos: [],
		});
		const contentInfo = new ContentInfo({
			contentType: ContentInfo.SIGNED_DATA,
			content: signedData.toSchema(),
		});
		const der = new Uint8Array(contentInfo.toSchema().toBER(false));
		const encoded =
			bytesBase64(der)
				.match(/.{1,64}/g)
				?.join('\n') ?? '';
		return result(`-----BEGIN PKCS7-----\n${encoded}\n-----END PKCS7-----`, 'certificates.p7b');
	},
	undefined,
	'tools.p7b-bundle.creates_an_unsigned_signeddata_bundle_cont',
);
