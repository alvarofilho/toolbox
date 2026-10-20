import type { TranslationKey } from '@app/core/models/tool';
import { input, number } from '@app/features/tools/_shared/controls';

export const colorInput = (key: string, label: TranslationKey, value: string) =>
	input(key, label, value, 'text');

export const size = (key: string, label: TranslationKey, value: number, min = 0, max = 1000) =>
	number(key, label, value, min, max);
