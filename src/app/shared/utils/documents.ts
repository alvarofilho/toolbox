import { randomString } from '@app/shared/utils/random';

const mod11 = (sum: number): string => String(sum % 11 < 2 ? 0 : 11 - (sum % 11));

export function cpfDigits(base: string): string {
	if (!/^\d{9}$/.test(base)) {
		throw new Error('CPF: 9 digits');
	}
	const first = mod11(Array.from(base).reduce((sum, n, i) => sum + Number(n) * (10 - i), 0));
	const full = base + first;
	return first + mod11(Array.from(full).reduce((sum, n, i) => sum + Number(n) * (11 - i), 0));
}

export function cnpjDigits(base: string): string {
	if (!/^[A-Z0-9]{12}$/.test(base)) {
		throw new Error('CNPJ: 12 characters (A–Z, 0–9)');
	}
	const digit = (value: string): string =>
		mod11(
			Array.from(value).reduce(
				(sum, n, i) => sum + (n.charCodeAt(0) - 48) * (((value.length - 1 - i) % 8) + 2),
				0,
			),
		);
	const first = digit(base);
	return first + digit(base + first);
}

export function normalizeDocument(value: string): string {
	return value.replace(/[.\-/\s]/g, '').toUpperCase();
}

export function validDocument(value: string, kind: 'cpf' | 'cnpj'): boolean {
	const clean = normalizeDocument(value);
	if (/^(.)\1+$/.test(clean)) {
		return false;
	}
	if (kind === 'cpf') {
		return /^\d{11}$/.test(clean) && cpfDigits(clean.slice(0, 9)) === clean.slice(9);
	}
	return /^[A-Z0-9]{12}\d{2}$/.test(clean) && cnpjDigits(clean.slice(0, 12)) === clean.slice(12);
}

export function formatDocument(value: string, kind: 'cpf' | 'cnpj'): string {
	return kind === 'cpf'
		? value.replace(/^(\d{3})(\d{3})(\d{3})(\d{2})$/, '$1.$2.$3-$4')
		: value.replace(/^(.{2})(.{3})(.{3})(.{4})(.{2})$/, '$1.$2.$3/$4-$5');
}

export function generateDocument(kind: 'cpf' | 'cnpj', alpha = false, formatted = true): string {
	let base: string;
	do {
		base = randomString(
			kind === 'cpf' ? 9 : 12,
			kind === 'cnpj' && alpha ? '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ' : '0123456789',
		);
	} while (/^(.)\1+$/.test(base));
	const value = base + (kind === 'cpf' ? cpfDigits(base) : cnpjDigits(base));
	return formatted ? formatDocument(value, kind) : value;
}
