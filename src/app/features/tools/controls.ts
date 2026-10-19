import { text, type ToolControl } from '../../core/models/tool';

export const input = (
  key: string,
  pt: string,
  en: string,
  value = '',
  type: ToolControl['type'] = 'textarea',
): ToolControl => ({ key, label: text(pt, en), value, type });

export const select = (
  key: string,
  pt: string,
  en: string,
  options: readonly (readonly [string, string, string])[],
  value = options[0][0],
): ToolControl => ({
  key,
  label: text(pt, en),
  type: 'select',
  value,
  options: options.map(([value, pt, en]) => ({ value, label: text(pt, en) })),
});

export const number = (
  key: string,
  pt: string,
  en: string,
  value: number,
  min: number,
  max: number,
): ToolControl => ({ key, label: text(pt, en), value: String(value), type: 'number', min, max });

export const check = (key: string, pt: string, en: string, checked = true): ToolControl =>
  input(key, pt, en, String(checked), 'checkbox');
export const source = input('input', 'Entrada', 'Input');
export const transform = text('Transformar', 'Transform');
export const generate = text('Gerar resultado', 'Generate result');
export const synthetic = text(
  'Dados sintéticos para testes. Dígitos verificadores válidos não comprovam existência cadastral.',
  'Synthetic test data. Valid check digits do not prove registration.',
);
