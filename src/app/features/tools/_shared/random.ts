import { boundedNumber, TranslatedToolError } from '@app/core/models/tool';

export function randomInt(max: number): number {
	if (!Number.isInteger(max) || max < 1 || max > 0x100000000) {
		throw new Error('Invalid range');
	}
	const limit = Math.floor(0x100000000 / max) * max;
	let value: number;
	do {
		value = crypto.getRandomValues(new Uint32Array(1))[0];
	} while (value >= limit);
	return value % max;
}

export function randomString(length: number, alphabet: string): string {
	boundedNumber(String(length), 1, 4096);
	if (!alphabet.length) {
		throw new Error('Select at least one character set / Selecione caracteres.');
	}
	return Array.from({ length }, () => alphabet[randomInt(alphabet.length)]).join('');
}

export const hex = (bytes: Uint8Array): string =>
	Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');

export function uuid(version: string, int: (max: number) => number = randomInt): string {
	if (version === '4') {
		if (int !== randomInt) {
			const hex = Array.from({ length: 32 }, () => int(16).toString(16))
				.join('')
				.split('');
			hex[12] = '4';
			hex[16] = ((Number.parseInt(hex[16] ?? '0', 16) & 3) | 8).toString(16);
			const value = hex.join('');
			return `${value.slice(0, 8)}-${value.slice(8, 12)}-${value.slice(12, 16)}-${value.slice(16, 20)}-${value.slice(20)}`;
		}
		return crypto.randomUUID();
	}
	if (version !== '7') {
		throw new Error('UUID version: 4 / 7');
	}
	const bytes = crypto.getRandomValues(new Uint8Array(16));
	let time = BigInt(Date.now());
	for (let i = 5; i >= 0; i--) {
		bytes[i] = Number(time & 255n);
		time >>= 8n;
	}
	bytes[6] = (bytes[6] & 15) | 112;
	bytes[8] = (bytes[8] & 63) | 128;
	const value = hex(bytes);
	return `${value.slice(0, 8)}-${value.slice(8, 12)}-${value.slice(12, 16)}-${value.slice(16, 20)}-${value.slice(20)}`;
}

export interface PasswordOptions {
	readonly minimums?: readonly number[];
	readonly avoidAmbiguous?: boolean;
}

const ambiguousCharacters = new Set('0Ool1I|');

export function password(
	length: number,
	sets: readonly string[],
	options: PasswordOptions = {},
): string {
	boundedNumber(String(length), 8, 256);
	if (!sets.length) {
		throw new TranslatedToolError('tools.password.select_character_set');
	}
	if (options.minimums && options.minimums.length !== sets.length) {
		throw new TranslatedToolError('tools.password.invalid_minimums');
	}
	const characterSets = sets.map((set) =>
		options.avoidAmbiguous
			? Array.from(set)
					.filter((character) => !ambiguousCharacters.has(character))
					.join('')
			: set,
	);
	if (characterSets.some((set) => !set.length)) {
		throw new TranslatedToolError('tools.password.no_characters_after_filter');
	}
	const minimums = characterSets.map((_, index) => {
		const minimum = options.minimums ? (options.minimums[index] ?? 0) : 1;
		if (!Number.isInteger(minimum) || minimum < 0) {
			throw new TranslatedToolError('tools.password.invalid_minimums');
		}
		return minimum;
	});
	const requiredCount = minimums.reduce((sum, minimum) => sum + minimum, 0);
	if (requiredCount > length) {
		throw new TranslatedToolError('tools.password.minimums_exceed_length');
	}
	const chars = characterSets.flatMap((set, index) => {
		const minimum = minimums[index] ?? 0;
		return minimum > 0 ? Array.from(randomString(minimum, set)) : [];
	});
	const remainingCount = length - requiredCount;
	if (remainingCount > 0) {
		chars.push(...Array.from(randomString(remainingCount, characterSets.join(''))));
	}
	for (let i = chars.length - 1; i > 0; i--) {
		const j = randomInt(i + 1);
		[chars[i], chars[j]] = [chars[j], chars[i]];
	}
	return chars.join('');
}
