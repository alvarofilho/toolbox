import 'reflect-metadata';

import { fromBER } from 'asn1js';

import { CertificateRevocationList } from 'pkijs';

import { tool, result } from '@app/features/tools/_shared/definition';

import { source } from '@app/features/tools/_shared/controls';

import { field, text } from '@app/core/models/tool';

import { base64Bytes } from '@app/features/tools/_shared/bytes';

import { pemBlocks } from '@app/features/tools/security/pem';

export const definition = tool(
	'crl-explorer',
	[source],
	(v) => {
		const value = field(v, 'input').trim();
		const bytes = value.startsWith('-----') ? pemBlocks(value)[0].bytes : base64Bytes(value);
		const parsed = fromBER(bytes.buffer);
		if (parsed.offset === -1 || parsed.offset !== bytes.length) {
			throw new Error('CRL ASN.1 inválida / Invalid CRL ASN.1');
		}
		const crl = new CertificateRevocationList({ schema: parsed.result });
		return result({
			issuer: crl.issuer.toJSON(),
			thisUpdate: crl.thisUpdate.toJSON(),
			nextUpdate: crl.nextUpdate?.toJSON() ?? null,
			revokedCertificates: crl.revokedCertificates?.map((entry) => entry.toJSON()) ?? [],
			signatureAlgorithm: crl.signatureAlgorithm.toJSON(),
			signatureVerified: false,
		});
	},
	undefined,
	text(
		'Inspeciona a estrutura da CRL. Não consulta nem confirma o estado de revogação de um certificado.',
		'Inspects the CRL structure. It does not query or confirm a certificate revocation status.',
	),
);
