import 'reflect-metadata';

import { X509Certificate } from '@peculiar/x509';

export const certInfo = (cert: X509Certificate) => ({
	subject: cert.subject,
	issuer: cert.issuer,
	serial: cert.serialNumber,
	notBefore: cert.notBefore,
	notAfter: cert.notAfter,
	validNow: Date.now() >= cert.notBefore.getTime() && Date.now() <= cert.notAfter.getTime(),
	signatureAlgorithm: cert.signatureAlgorithm,
	publicKeyAlgorithm: cert.publicKey.algorithm,
	extensions: cert.extensions.map((e) => ({
		type: e.type,
		critical: e.critical,
		text: e.toString(),
	})),
});
