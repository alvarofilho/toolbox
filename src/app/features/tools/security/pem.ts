import 'reflect-metadata';

import { base64Bytes } from '@app/features/tools/_shared/bytes';

export function pemBlocks(value: string): { label: string; bytes: Uint8Array<ArrayBuffer> }[] {
	const matches = [
		...value.matchAll(/-----BEGIN ([A-Z0-9 ]+)-----\s*([A-Za-z0-9+/=\s]+?)\s*-----END \1-----/g),
	];
	if (!matches.length || matches.length > 30) {
		throw new Error('Use 1–30 blocos PEM / Use 1–30 PEM blocks');
	}
	return matches.map((m) => ({ label: m[1], bytes: base64Bytes(m[2].replace(/\s/g, '')) }));
}
