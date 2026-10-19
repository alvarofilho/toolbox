import 'reflect-metadata';

import { fromBER } from 'asn1js';

import { Certificate, SignedData, TimeStampResp, TSTInfo } from 'pkijs';

import { tool, result } from '@app/features/tools/_shared/definition';

import { input } from '@app/features/tools/_shared/controls';

import { field, text } from '@app/core/models/tool';

import { base64Bytes, utf8 } from '@app/features/tools/_shared/bytes';

import { pemBlocks } from '@app/features/tools/security/pem';

export const definition = tool(
	'tsr-decoder',
	[
		input('input', 'Resposta TSR (PEM ou Base64)', 'TSR response (PEM or Base64)'),
		input('content', 'Conteúdo original (opcional)', 'Original content (optional)'),
		input(
			'trustedCertificates',
			'Certificados confiáveis da TSA (PEM, opcional)',
			'Trusted TSA certificates (PEM, optional)',
		),
	],
	async (v) => {
		const value = field(v, 'input').trim();
		const base64Value = value.replace(/-----BEGIN TS[PR]-----|-----END TS[PR]-----|\s/g, '');
		const bytes = base64Bytes(base64Value);
		const parsed = fromBER(bytes.buffer);
		if (parsed.offset === -1 || parsed.offset !== bytes.length) {
			throw new Error('Resposta TSR inválida / Invalid TSR response');
		}
		const response = new TimeStampResp({ schema: parsed.result });
		const content = field(v, 'content');
		const trustedCertificatesPem = field(v, 'trustedCertificates').trim();
		let signatureAndTrustVerified: boolean | null = null;
		let imprintMatches: boolean | null = null;
		if (response.timeStampToken && content && trustedCertificatesPem) {
			const trustedCerts = pemBlocks(trustedCertificatesPem)
				.filter(({ label }) => label === 'CERTIFICATE')
				.map(({ bytes: certBytes }) => {
					const cert = fromBER(certBytes.buffer);
					if (cert.offset === -1 || cert.offset !== certBytes.length) {
						throw new Error('Certificado confiável inválido / Invalid trusted certificate');
					}
					return new Certificate({ schema: cert.result });
				});
			if (!trustedCerts.length) {
				throw new Error(
					'Informe ao menos um certificado PEM / Provide at least one PEM certificate',
				);
			}
			const signedData = new SignedData({ schema: response.timeStampToken.content });
			const encodedTstInfo = signedData.encapContentInfo.eContent;
			if (!encodedTstInfo) {
				throw new Error('Token sem TSTInfo / Token is missing TSTInfo');
			}
			const tstInfoBytes = new Uint8Array(encodedTstInfo.getValue());
			const tstInfoAsn = fromBER(tstInfoBytes.buffer);
			if (tstInfoAsn.offset === -1 || tstInfoAsn.offset !== tstInfoBytes.length) {
				throw new Error('TSTInfo inválido / Invalid TSTInfo');
			}
			const tstInfo = new TSTInfo({ schema: tstInfoAsn.result });
			const hashName = new Map<string, string>([
				['1.3.14.3.2.26', 'SHA-1'],
				['2.16.840.1.101.3.4.2.1', 'SHA-256'],
				['2.16.840.1.101.3.4.2.2', 'SHA-384'],
				['2.16.840.1.101.3.4.2.3', 'SHA-512'],
			]).get(tstInfo.messageImprint.hashAlgorithm.algorithmId);
			if (!hashName) {
				throw new Error(
					'Algoritmo de hash do carimbo não suportado / Unsupported timestamp hash algorithm',
				);
			}
			const expectedImprint = new Uint8Array(
				tstInfo.messageImprint.hashedMessage.valueBlock.valueHexView,
			);
			const actualImprint = new Uint8Array(await crypto.subtle.digest(hashName, utf8(content)));
			imprintMatches =
				expectedImprint.length === actualImprint.length &&
				expectedImprint.every((byte, index) => byte === actualImprint[index]);
			try {
				signatureAndTrustVerified = await signedData.verify({
					signer: 0,
					trustedCerts,
					checkChain: true,
				});
			} catch {
				signatureAndTrustVerified = false;
			}
		}
		return result({
			status: response.status.status,
			statusInfo: response.status.toJSON(),
			hasTimeStampToken: !!response.timeStampToken,
			tokenContentType: response.timeStampToken?.contentType ?? null,
			verificationPerformed: signatureAndTrustVerified !== null,
			signatureAndTrustVerified,
			imprintMatches,
			verificationRequiresOriginalContentAndTrustedTsaCertificate: true,
		});
	},
	undefined,
	text(
		'Mostra o status e a estrutura. Com o conteúdo original e certificados confiáveis, verifica a assinatura do token, o imprint e a cadeia da TSA.',
		'Shows the status and structure. With the original content and trusted certificates, it verifies the token signature, imprint, and TSA chain.',
	),
);
