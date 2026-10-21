import { randomInt } from '@app/features/tools/_shared/random';

export const SYNTHETIC_SEED_VERSION = 'seed-v1';

export interface RandomSource {
	int(max: number): number;
}

/** Creates a per-execution source. Empty seeds retain cryptographically secure randomness. */
export function randomSource(seed: string): RandomSource {
	if (!seed) {
		return { int: randomInt };
	}
	if (seed.length > 256) {
		throw new Error('Seed: máximo 256 caracteres / Seed max 256 characters');
	}
	let state = 2166136261;
	for (const character of seed) {
		state = Math.imul(state ^ character.charCodeAt(0), 16777619);
	}
	return {
		int(max: number): number {
			if (!Number.isInteger(max) || max < 1 || max > 0x100000000) {
				throw new Error('Invalid range');
			}
			state = (state + 0x6d2b79f5) | 0;
			let value = state;
			value = Math.imul(value ^ (value >>> 15), value | 1);
			value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
			return ((value ^ (value >>> 14)) >>> 0) % max;
		},
	};
}
