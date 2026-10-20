import 'reflect-metadata';

import { X509Certificate } from '@peculiar/x509';

import { importPKCS8, importSPKI, exportJWK } from 'jose';

import { tool, result } from '@app/features/tools/_shared/definition';

import { source, select } from '@app/features/tools/_shared/controls';

import { field } from '@app/core/models/tool';

export const definition = tool(
	'pem-jwk',
	[
		source,
		select(
			'algorithm',
			'tools.pem-jwk.jose_algorithm',
			[
				['RS256', 'tools.pem-jwk.rs256'],
				['PS256', 'tools.pem-jwk.ps256'],
				['ES256', 'tools.pem-jwk.es256'],
				['ES384', 'tools.pem-jwk.es384'],
				['EdDSA', 'tools.pem-jwk.eddsa'],
			],
			undefined,
		),
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
	'tools.pem-jwk.exported_private_keys_contain_secret_mater',
);
