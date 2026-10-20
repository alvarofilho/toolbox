import type { ToolControl, TranslationKey } from '@app/core/models/tool';

export const input = (
	key: string,
	label: TranslationKey,
	value = '',
	type: ToolControl['type'] = 'textarea',
): ToolControl => ({ key, label, value, type });

export const select = (
	key: string,
	label: TranslationKey,
	options: readonly (readonly [value: string, label?: TranslationKey])[],
	value = options[0][0],
): ToolControl => ({
	key,
	label,
	type: 'select',
	value,
	options: options.map(([value, label]) => ({ value, label })),
});

export const number = (
	key: string,
	label: TranslationKey,
	value: number,
	min: number,
	max: number,
	step: number | 'any' = 1,
): ToolControl => ({
	key,
	label,
	value: String(value),
	type: 'number',
	min,
	max,
	step,
	inputMode: step === 'any' ? 'decimal' : 'numeric',
});

export const check = (key: string, label: TranslationKey, checked = true): ToolControl =>
	input(key, label, String(checked), 'checkbox');

export const source = input('input', 'common.input');
export const transform: TranslationKey = 'common.transform';
export const generate: TranslationKey = 'common.generate_result';
export const synthetic: TranslationKey = 'common.synthetic_test_data_notice_short';
