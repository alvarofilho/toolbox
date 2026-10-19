import { field, text } from '@app/core/models/tool';

import { result, tool } from '@app/features/tools/_shared/definition';

import { select } from '@app/features/tools/_shared/controls';

export const definition = tool(
	'rsa-keypair',
	[
		select('bits', 'Tamanho da chave', 'Key size', [
			['2048', '2048 bits', '2048 bits'],
			['3072', '3072 bits', '3072 bits'],
		]),
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
	text(
		'A chave privada é secreta. O processamento ocorre no navegador; guarde o arquivo com segurança.',
		'The private key is secret. Processing stays in the browser; store the file securely.',
	),
);
