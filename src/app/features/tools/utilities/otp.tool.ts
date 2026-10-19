import { field, text } from '@app/core/models/tool';

import { input } from '@app/features/tools/_shared/controls';

import { mode } from '@app/features/tools/_shared/execution-controls';

import { result, tool } from '@app/features/tools/_shared/definition';

import { randomString } from '@app/features/tools/_shared/random';

const base32Chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';

function decodeBase32(value: string): Uint8Array<ArrayBuffer> {
	const clean = value.toUpperCase().replace(/=+$/, '').replace(/\s/g, '');
	if (!/^[A-Z2-7]+$/.test(clean)) {
		throw new Error('Segredo Base32 inválido / Invalid Base32 secret');
	}
	let buffer = 0;
	let bits = 0;
	const bytes: number[] = [];
	for (const char of clean) {
		buffer = (buffer << 5) | base32Chars.indexOf(char);
		bits += 5;
		if (bits >= 8) {
			bytes.push((buffer >>> (bits - 8)) & 255);
			bits -= 8;
		}
	}
	return Uint8Array.from(bytes);
}

async function totp(secret: string, timeSeconds: number): Promise<string> {
	const key = await crypto.subtle.importKey(
		'raw',
		decodeBase32(secret),
		{ name: 'HMAC', hash: 'SHA-1' },
		false,
		['sign'],
	);
	const counter = BigInt(Math.floor(timeSeconds / 30));
	const message = new Uint8Array(8);
	new DataView(message.buffer).setBigUint64(0, counter, false);
	const digest = new Uint8Array(await crypto.subtle.sign('HMAC', key, message));
	const offset = digest[digest.length - 1] & 15;
	const binary =
		((digest[offset] & 127) << 24) |
		((digest[offset + 1] & 255) << 16) |
		((digest[offset + 2] & 255) << 8) |
		(digest[offset + 3] & 255);
	return String(binary % 1_000_000).padStart(6, '0');
}

export const definition = tool(
	'otp',
	[
		mode(['generate', 'verify']),
		input(
			'secret',
			'Segredo Base32 (vazio gera um)',
			'Base32 secret (blank generates one)',
			'',
			'text',
			'tools.otp',
		),
		input(
			'code',
			'Código de 6 dígitos (para validar)',
			'6-digit code (to verify)',
			'',
			'text',
			'tools.otp',
		),
	],
	async (v) => {
		let secret = field(v, 'secret').trim().toUpperCase();
		if (!secret) {
			secret = randomString(32, base32Chars);
		}
		const now = Math.floor(Date.now() / 1000);
		if (field(v, 'mode') === 'verify') {
			const code = field(v, 'code');
			if (!/^\d{6}$/.test(code)) {
				throw new Error('Informe 6 dígitos / Enter 6 digits');
			}
			const matches = await Promise.all([-30, 0, 30].map((delta) => totp(secret, now + delta)));
			return result({
				valid: matches.includes(code),
				algorithm: 'TOTP / HMAC-SHA1',
				periodSeconds: 30,
				digits: 6,
			});
		}
		const code = await totp(secret, now);
		return result({
			secret,
			code,
			algorithm: 'TOTP / HMAC-SHA1',
			periodSeconds: 30,
			validForSeconds: 30 - (now % 30),
		});
	},
	undefined,
	text(
		'Guarde o segredo com segurança. O código depende do relógio do dispositivo.',
		'Keep the secret secure. The code depends on the device clock.',
		undefined,
		'tools.otp',
	),
);
