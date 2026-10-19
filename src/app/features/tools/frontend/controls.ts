import { input, number } from '@app/features/tools/_shared/controls';

export const colorInput = (
	key: string,
	pt: string,
	en: string,
	value: string,
	namespace?: `tools.${string}`,
) => input(key, pt, en, value, 'text', namespace);

export const size = (
	key: string,
	pt: string,
	en: string,
	value: number,
	min = 0,
	max = 1000,
	namespace?: `tools.${string}`,
) => number(key, pt, en, value, min, max, undefined, namespace);
