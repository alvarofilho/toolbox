import 'reflect-metadata';

import { utf8, bytesHex } from '@app/features/tools/_shared/bytes';

export async function hmac(message: string, key: string, hash = 'SHA-256'): Promise<string> {
	if (!key) {
		throw new Error('Informe o segredo / Enter a secret');
	}
	const imported = await crypto.subtle.importKey('raw', utf8(key), { name: 'HMAC', hash }, false, [
		'sign',
	]);
	return bytesHex(new Uint8Array(await crypto.subtle.sign('HMAC', imported, utf8(message))));
}
