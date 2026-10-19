import 'reflect-metadata';

import { X509Certificate } from '@peculiar/x509';

import { tool, result } from '@app/features/tools/_shared/definition';

import { source } from '@app/features/tools/_shared/controls';

import { field, text } from '@app/core/models/tool';

import { certInfo } from '@app/features/tools/security/certificates';

export const definition = tool(
	'certificate-chain',
	[source],
	async (v) => {
		const blocks = field(v, 'input').match(
			/-----BEGIN CERTIFICATE-----[\s\S]*?-----END CERTIFICATE-----/g,
		);
		if (!blocks?.length || blocks.length > 20) {
			throw new Error('Use 1–20 certificados PEM / Use 1–20 PEM certificates');
		}
		const certs = blocks.map((pem) => new X509Certificate(pem));
		const certificates = await Promise.all(
			certs.map(async (cert) => {
				const issuer = certs.find((candidate) => candidate.subject === cert.issuer);
				return {
					...certInfo(cert),
					issuerPresent: !!issuer,
					signatureVerified: issuer
						? await cert.verify({ publicKey: issuer.publicKey, signatureOnly: true })
						: false,
				};
			}),
		);
		return result({
			certificates,
			trustEstablished: false,
			revocationChecked: false,
			hostnameChecked: false,
			policyValidation: false,
		});
	},
	undefined,
	text(
		'Verifica assinaturas entre os certificados fornecidos e mostra validade temporal. Não estabelece confiança de uma CA nem consulta revogação.',
		'Verifies signatures between supplied certificates and shows validity dates. Does not establish CA trust or check revocation.',
	),
);
