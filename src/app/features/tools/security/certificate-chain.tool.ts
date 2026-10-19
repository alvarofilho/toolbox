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
		const ordered: X509Certificate[] = [];
		const remaining = [...certs];
		let current = remaining.shift();
		while (current) {
			ordered.push(current);
			let issuerIndex = -1;
			for (let index = 0; index < remaining.length; index++) {
				const candidate = remaining[index];
				if (
					candidate.subject === current.issuer &&
					(await current.verify({ publicKey: candidate.publicKey, signatureOnly: true }))
				) {
					issuerIndex = index;
					break;
				}
			}
			if (issuerIndex < 0) {
				break;
			}
			current = remaining.splice(issuerIndex, 1)[0];
		}
		const path = await Promise.all(
			ordered.map(async (cert, index) => {
				const issuer = ordered[index + 1] ?? (cert.subject === cert.issuer ? cert : undefined);
				const signatureVerified = issuer
					? await cert.verify({ publicKey: issuer.publicKey, signatureOnly: true })
					: null;
				return {
					...certInfo(cert),
					issuerCertificateInInput: !!issuer,
					issuerSubject: issuer?.subject ?? null,
					signatureVerified,
				};
			}),
		);
		return result({
			certificates: path,
			suppliedCertificateCount: certs.length,
			orderedFrom: 'first supplied certificate',
			unlinkedCertificates: remaining.map((cert) => cert.subject),
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
		undefined,
		'tools.certificate-chain',
	),
);
