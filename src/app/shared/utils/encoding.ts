export function base64Encode(value: string): string {
	return btoa(Array.from(new TextEncoder().encode(value), (b) => String.fromCharCode(b)).join(''));
}

export function base64Decode(value: string): string {
	const compact = value.replace(/\s/g, '');
	if (!/^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}(?:==)?|[A-Za-z0-9+/]{3}=?)?$/.test(compact)) {
		throw new Error('Base64 inválido / Invalid Base64.');
	}
	return new TextDecoder('utf-8', { fatal: true }).decode(
		Uint8Array.from(atob(compact), (c) => c.charCodeAt(0)),
	);
}

export function decodeJwt(value: string): string {
	const parts = value.trim().split('.');
	if (
		parts.length !== 3 ||
		!parts[0] ||
		!parts[1] ||
		!parts.every((p) => /^[A-Za-z0-9_-]*$/.test(p))
	) {
		throw new Error('JWT: header.payload.signature');
	}
	const decode = (part: string): unknown => {
		const result: unknown = JSON.parse(base64Decode(part.replace(/-/g, '+').replace(/_/g, '/')));
		if (typeof result !== 'object' || result === null || Array.isArray(result)) {
			throw new Error('JWT: JSON object required');
		}
		return result;
	};
	const header = decode(parts[0]);
	const payload = decode(parts[1]);
	const claims: Record<string, string> = {};
	if (typeof payload === 'object' && payload !== null) {
		for (const [key, val] of Object.entries(payload)) {
			if (['exp', 'iat', 'nbf'].includes(key) && typeof val === 'number') {
				const date = new Date(val * 1000);
				if (Number.isFinite(date.getTime())) {
					claims[key] = date.toISOString();
				}
				if (key === 'exp') {
					claims['expiration'] = val * 1000 <= Date.now() ? 'expired' : 'not expired';
				}
			}
		}
	}
	return JSON.stringify({ header, payload, dates: claims, signatureVerified: false }, null, 2);
}

export function timestamp(value: string, mode: string): string {
	if (mode === 'iso') {
		if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,3})?(?:Z|[+-]\d{2}:\d{2})$/.test(value)) {
			throw new Error('ISO 8601: 2026-01-01T00:00:00Z');
		}
		const ms = Date.parse(value);
		const year = Number(value.slice(0, 4));
		const month = Number(value.slice(5, 7));
		const day = Number(value.slice(8, 10));
		const leap = year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
		const days = [31, leap ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
		if (
			month < 1 ||
			month > 12 ||
			day < 1 ||
			day > days[month - 1] ||
			Number(value.slice(11, 13)) > 23 ||
			Number(value.slice(14, 16)) > 59 ||
			Number(value.slice(17, 19)) > 59
		) {
			throw new Error('Data inválida / Invalid date');
		}
		if (!Number.isFinite(ms)) {
			throw new Error('Data inválida / Invalid date');
		}
		return JSON.stringify(
			{ seconds: Math.floor(ms / 1000), milliseconds: ms, utc: new Date(ms).toISOString() },
			null,
			2,
		);
	}
	if (!/^-?\d+(?:\.\d+)?$/.test(value)) {
		throw new Error('Timestamp numérico / Numeric timestamp required');
	}
	const ms = Number(value) * (mode === 'seconds' ? 1000 : 1);
	if (!Number.isFinite(ms) || Math.abs(ms) > 8640000000000000) {
		throw new Error('Timestamp fora do intervalo / Out of range');
	}
	const date = new Date(ms);
	return JSON.stringify(
		{
			utc: date.toISOString(),
			local: date.toString(),
			seconds: Math.floor(ms / 1000),
			milliseconds: ms,
		},
		null,
		2,
	);
}

export function convertCase(value: string, mode: string): string {
	const words = value
		.replace(/([a-z\d])([A-Z])/g, '$1 $2')
		.replace(/([A-Z])([A-Z][a-z])/g, '$1 $2')
		.normalize('NFD')
		.replace(/[\u0300-\u036f]/g, '')
		.split(/[^\p{L}\p{N}]+/u)
		.filter(Boolean)
		.map((w) => w.toLowerCase());
	const title = (word: string): string => word.charAt(0).toUpperCase() + word.slice(1);
	switch (mode) {
		case 'upper':
			return value.toUpperCase();
		case 'lower':
			return value.toLowerCase();
		case 'snake':
			return words.join('_');
		case 'kebab':
			return words.join('-');
		case 'pascal':
			return words.map(title).join('');
		case 'camel':
			return words.map((w, i) => (i ? title(w) : w)).join('');
		default:
			throw new Error('Invalid case');
	}
}
