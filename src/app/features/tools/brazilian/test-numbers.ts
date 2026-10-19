import { randomInt } from '@app/features/tools/_shared/random';

export function digits(size: number): string {
	return Array.from({ length: size }, () => String(randomInt(10))).join('');
}

export function generateByValidation(
	size: number,
	validate: (value: string) => { ok: boolean },
): string {
	for (let attempt = 0; attempt < 1000; attempt++) {
		const candidate = digits(size);
		if (validate(candidate).ok) {
			return candidate;
		}
	}
	throw new Error('Não foi possível gerar um número de teste / Could not generate a test number');
}
