import { field } from '@app/core/models/tool';

import { result, tool } from '@app/features/tools/_shared/definition';

import { select } from '@app/features/tools/_shared/controls';

export const definition = tool(
	'rsa-keypair',
	[
		select(
			'bits',
			'tools.rsa-keypair.key_size',
			[
				['2048', 'tools.rsa-keypair.2048_bits'],
				['3072', 'tools.rsa-keypair.3072_bits'],
			],
			undefined,
		),
	],
	async (v) => {
		const bits = Number(field(v, 'bits'));
		if (bits !== 2048 && bits !== 3072) {
			throw new Error('Tamanho de chave não permitido / Unsupported key size');
		}
		const pair = await crypto.subtle.generateKey(
			{
				name: 'RSA-OAEP',
				modulusLength: bits,
				publicExponent: new Uint8Array([1, 0, 1]),
				hash: 'SHA-256',
			},
			true,
			['encrypt', 'decrypt'],
		);
		return result(
			{
				algorithm: 'RSA-OAEP-SHA256',
				publicKey: await crypto.subtle.exportKey('jwk', pair.publicKey),
				privateKey: await crypto.subtle.exportKey('jwk', pair.privateKey),
			},
			'rsa-keypair.json',
		);
	},
	undefined,
	'tools.rsa-keypair.the_private_key_is_secret_processing_stays',
);
