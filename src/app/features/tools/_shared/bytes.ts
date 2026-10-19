export function bytesHex(bytes: Uint8Array): string {
	return Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
}

export function hexBytes(s: string): Uint8Array<ArrayBuffer> {
	if (!/^(?:[0-9a-f]{2})+$/i.test(s)) {
		throw new Error('Hexadecimal inválido / Invalid hex');
	}
	return Uint8Array.from(s.match(/../g) ?? [], (c) => parseInt(c, 16));
}

export function base64Bytes(s: string): Uint8Array<ArrayBuffer> {
	return Uint8Array.from(atob(s), (c) => c.charCodeAt(0));
}

export function bytesBase64(b: Uint8Array): string {
	let s = '';
	for (const byte of b) {
		s += String.fromCharCode(byte);
	}
	return btoa(s);
}

export const utf8 = (s: string): Uint8Array<ArrayBuffer> => new TextEncoder().encode(s);
