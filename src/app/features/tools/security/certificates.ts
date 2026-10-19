import 'reflect-metadata';

import {
	BasicConstraintsExtension,
	ExtendedKeyUsageExtension,
	KeyUsagesExtension,
	SubjectAlternativeNameExtension,
	X509Certificate,
} from '@peculiar/x509';

export const certInfo = (cert: X509Certificate, now = new Date()) => {
	const basicConstraints = cert.getExtension(BasicConstraintsExtension);
	const keyUsages = cert.getExtension(KeyUsagesExtension);
	const extendedKeyUsages = cert.getExtension(ExtendedKeyUsageExtension);
	const subjectAlternativeName = cert.getExtension(SubjectAlternativeNameExtension);

	return {
		subject: cert.subject,
		issuer: cert.issuer,
		serial: cert.serialNumber,
		notBefore: cert.notBefore,
		notAfter: cert.notAfter,
		validNow: now >= cert.notBefore && now <= cert.notAfter,
		signatureAlgorithm: cert.signatureAlgorithm,
		publicKeyAlgorithm: cert.publicKey.algorithm,
		isCertificateAuthority: basicConstraints?.ca ?? null,
		keyUsages: keyUsages?.toTextObject() ?? null,
		extendedKeyUsages: extendedKeyUsages?.usages ?? [],
		subjectAlternativeNames: subjectAlternativeName?.names.toJSON() ?? null,
		extensions: cert.extensions.map((e) => ({
			type: e.type,
			critical: e.critical,
			text: e.toString(),
		})),
	};
};
