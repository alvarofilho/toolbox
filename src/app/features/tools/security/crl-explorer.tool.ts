import 'reflect-metadata';

import { X509Certificate, X509Crl } from '@peculiar/x509';

import { tool, result } from '@app/features/tools/_shared/definition';

import { input } from '@app/features/tools/_shared/controls';

import { field, text } from '@app/core/models/tool';

import { certInfo } from '@app/features/tools/security/certificates';

export const definition = tool(
	'crl-explorer',
	[
		input(
			'crl',
			'CRL (PEM ou Base64)',
			'CRL (PEM or Base64)',
			undefined,
			undefined,
			'tools.crl-explorer',
		),
		input(
			'certificate',
			'Certificado a consultar (PEM, opcional)',
			'Certificate to check (PEM, optional)',
			undefined,
			undefined,
			'tools.crl-explorer',
		),
		input(
			'issuer',
			'Certificado emissor da CRL (PEM, opcional)',
			'CRL issuer certificate (PEM, optional)',
			undefined,
			undefined,
			'tools.crl-explorer',
		),
	],
	async (v) => {
		const value = field(v, 'crl').trim();
		if (!value) {
			throw new Error('Informe uma CRL / Provide a CRL');
		}
		const crl = new X509Crl(value);
		const now = new Date();
		const certificatePem = field(v, 'certificate').trim();
		const issuerPem = field(v, 'issuer').trim();
		const certificate = certificatePem ? new X509Certificate(certificatePem) : undefined;
		const issuer = issuerPem ? new X509Certificate(issuerPem) : undefined;
		const revokedEntry = certificate ? crl.findRevoked(certificate) : null;
		const certificateIssuerMatches = certificate ? certificate.issuer === crl.issuer : null;
		const issuerMatches = issuer ? issuer.subject === crl.issuer : null;
		const signatureVerified =
			issuer && issuerMatches ? await crl.verify({ publicKey: issuer }) : null;
		return result({
			issuer: crl.issuer,
			thisUpdate: crl.thisUpdate,
			nextUpdate: crl.nextUpdate ?? null,
			freshness:
				now < crl.thisUpdate
					? 'not_yet_valid'
					: crl.nextUpdate && now > crl.nextUpdate
						? 'stale'
						: 'current_or_no_expiry',
			revokedCertificateCount: crl.entries.length,
			revokedCertificates: crl.entries.map((entry) => ({
				serialNumber: entry.serialNumber,
				revocationDate: entry.revocationDate,
				reason: entry.reason ?? null,
			})),
			signatureAlgorithm: crl.signatureAlgorithm,
			certificateIssuerMatches,
			issuerCertificateMatches: issuerMatches,
			signatureVerified,
			certificate: certificate ? certInfo(certificate, now) : null,
			revocationStatus: certificate
				? !certificateIssuerMatches
					? 'issuer_mismatch'
					: revokedEntry
						? 'revoked'
						: 'not_listed_on_crl'
				: null,
			revocationCheckedAgainstCurrentAuthority: false,
		});
	},
	undefined,
	text(
		'Inspeciona a CRL e pode comparar um certificado. Uma CRL vencida ou sem consulta à autoridade não confirma o estado atual de revogação.',
		'Inspects a CRL and can compare a certificate. A stale CRL or lack of an authority lookup does not confirm current revocation status.',
		undefined,
		'tools.crl-explorer',
	),
);
