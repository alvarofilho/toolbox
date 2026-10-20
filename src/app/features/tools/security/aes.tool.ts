import 'reflect-metadata';

import { tool, result } from '@app/features/tools/_shared/definition';

import { source } from '@app/features/tools/_shared/controls';

import { mode } from '@app/features/tools/_shared/execution-controls';

import { field } from '@app/core/models/tool';

import { json, object } from '@app/features/tools/_shared/data';

import { utf8, bytesBase64, base64Bytes } from '@app/features/tools/_shared/bytes';

import { secret } from '@app/features/tools/security/controls';

export const definition = tool(
	'aes',
	[source, secret, mode(['encrypt', 'decrypt'])],
	async (v) => {
		const password = field(v, 'secret');
		if (password.length < 12) {
			throw new Error(
				'Use uma senha de pelo menos 12 caracteres / Use a password with at least 12 characters',
			);
		}
		const base = await crypto.subtle.importKey('raw', utf8(password), 'PBKDF2', false, [
			'deriveKey',
		]);
		if (field(v, 'mode') === 'encrypt') {
			const salt = crypto.getRandomValues(new Uint8Array(16)),
				iv = crypto.getRandomValues(new Uint8Array(12));
			const key = await crypto.subtle.deriveKey(
				{ name: 'PBKDF2', salt, iterations: 310000, hash: 'SHA-256' },
				base,
				{ name: 'AES-GCM', length: 256 },
				false,
				['encrypt'],
			);
			const encrypted = await crypto.subtle.encrypt(
				{ name: 'AES-GCM', iv },
				key,
				utf8(field(v, 'input')),
			);
			return result(
				{
					version: 1,
					algorithm: 'AES-256-GCM',
					kdf: 'PBKDF2-SHA256',
					iterations: 310000,
					salt: bytesBase64(salt),
					iv: bytesBase64(iv),
					ciphertext: bytesBase64(new Uint8Array(encrypted)),
				},
				'encrypted.json',
			);
		}
		const data = object(json(field(v, 'input')));
		if (
			data['version'] !== 1 ||
			data['algorithm'] !== 'AES-256-GCM' ||
			data['kdf'] !== 'PBKDF2-SHA256' ||
			data['iterations'] !== 310000 ||
			typeof data['salt'] !== 'string' ||
			typeof data['iv'] !== 'string' ||
			typeof data['ciphertext'] !== 'string'
		) {
			throw new Error('Envelope AES inválido / Invalid AES envelope');
		}
		const salt = base64Bytes(data['salt']),
			iv = base64Bytes(data['iv']);
		if (salt.length !== 16 || iv.length !== 12) {
			throw new Error('Salt/IV inválido / Invalid salt/IV');
		}
		const key = await crypto.subtle.deriveKey(
			{ name: 'PBKDF2', salt, iterations: 310000, hash: 'SHA-256' },
			base,
			{ name: 'AES-GCM', length: 256 },
			false,
			['decrypt'],
		);
		try {
			return result(
				new TextDecoder('utf-8', { fatal: true }).decode(
					await crypto.subtle.decrypt(
						{ name: 'AES-GCM', iv },
						key,
						base64Bytes(data['ciphertext']),
					),
				),
				'decrypted.txt',
			);
		} catch {
			throw new Error(
				'Senha incorreta ou conteúdo adulterado / Incorrect password or modified ciphertext',
			);
		}
	},
	{ input: 'Mensagem para teste', secret: 'uma-senha-de-teste' },
	'tools.aes.authenticated_aes_256_gcm_with_random_salt',
);
