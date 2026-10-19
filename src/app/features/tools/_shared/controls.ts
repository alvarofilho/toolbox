import { text, type ToolControl } from '@app/core/models/tool';

export const input = (
	key: string,
	pt: string,
	en: string,
	value = '',
	type: ToolControl['type'] = 'textarea',
	namespace?: `tools.${string}`,
): ToolControl => ({ key, label: text(pt, en, en, namespace), value, type });

export const select = (
	key: string,
	pt: string,
	en: string,
	options: readonly (readonly [string, string, string, string?])[],
	value = options[0][0],
	namespace?: `tools.${string}`,
): ToolControl => ({
	key,
	label: text(pt, en, en, namespace),
	type: 'select',
	value,
	options: options.map(([value, pt, en, es]) => ({
		value,
		label: text(pt, en, es ?? en, namespace),
	})),
});

export const number = (
	key: string,
	pt: string,
	en: string,
	value: number,
	min: number,
	max: number,
	step: number | 'any' = 1,
	namespace?: `tools.${string}`,
): ToolControl => ({
	key,
	label: text(pt, en, en, namespace),
	value: String(value),
	type: 'number',
	min,
	max,
	step,
	inputMode: step === 'any' ? 'decimal' : 'numeric',
});

export const check = (
	key: string,
	pt: string,
	en: string,
	checked = true,
	namespace?: `tools.${string}`,
): ToolControl => input(key, pt, en, String(checked), 'checkbox', namespace);
export const source = input('input', 'Entrada', 'Input');
export const transform = text('Transformar', 'Transform');
export const generate = text('Gerar resultado', 'Generate result');
export const synthetic = text(
	'Dados sintéticos para testes. Dígitos verificadores válidos não comprovam existência cadastral.',
	'Synthetic test data. Valid check digits do not prove registration.',
);
