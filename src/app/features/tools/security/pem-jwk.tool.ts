import 'reflect-metadata';

import { X509Certificate } from '@peculiar/x509';

import { importPKCS8, importSPKI, exportJWK } from 'jose';

import { tool, result } from '@app/features/tools/_shared/definition';

import { source, select } from '@app/features/tools/_shared/controls';

import { field, text } from '@app/core/models/tool';

export const definition = tool(
	'pem-jwk',
	[
		source,
		select('algorithm', 'Algoritmo JOSE', 'JOSE algorithm', [
			['RS256', 'RS256', 'RS256'],
			['PS256', 'PS256', 'PS256'],
			['ES256', 'ES256', 'ES256'],
			['ES384', 'ES384', 'ES384'],
			['EdDSA', 'EdDSA', 'EdDSA'],
		]),
	],
	async (v) => {
		const pem = field(v, 'input'),
			alg = field(v, 'algorithm');
		if (pem.includes('BEGIN CERTIFICATE')) {
			return result(
				await crypto.subtle.exportKey('jwk', await new X509Certificate(pem).publicKey.export()),
			);
		}
		if (pem.includes('BEGIN PUBLIC KEY')) {
			return result(await exportJWK(await importSPKI(pem, alg, { extractable: true })));
		}
		if (pem.includes('BEGIN PRIVATE KEY')) {
			return result(await exportJWK(await importPKCS8(pem, alg, { extractable: true })));
		}
		throw new Error(
			'Use CERTIFICATE, PUBLIC KEY (SPKI) ou PRIVATE KEY (PKCS#8) / Unsupported PEM type',
		);
	},
	undefined,
	text(
		'Chaves privadas exportadas contêm material secreto. O processamento fica no navegador.',
		'Exported private keys contain secret material. Processing stays in the browser.',
	),
);
