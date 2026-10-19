import { type ToolControl } from '@app/core/models/tool';
import { input, number, select } from '@app/features/tools/_shared/controls';

export const second = input('second', 'Segunda entrada', 'Second input');

export const count = number('count', 'Quantidade', 'Count', 5, 1, 1000);

const operations: Readonly<Record<string, readonly [string, string, string]>> = {
	encode: ['Codificar', 'Encode', 'Codificar'],
	decode: ['Decodificar', 'Decode', 'Decodificar'],
	generate: ['Gerar', 'Generate', 'Generar'],
	validate: ['Validar', 'Validate', 'Validar'],
	verify: ['Verificar', 'Verify', 'Verificar'],
	encrypt: ['Criptografar', 'Encrypt', 'Cifrar'],
	decrypt: ['Descriptografar', 'Decrypt', 'Descifrar'],
	merge: ['Unir arquivos', 'Merge files', 'Unir archivos'],
	extract: ['Extrair páginas', 'Extract pages', 'Extraer páginas'],
	split: ['Dividir arquivos', 'Split files', 'Dividir archivos'],
	hash: ['Gerar hash', 'Generate hash', 'Generar hash'],
	format: ['Aplicar máscara', 'Apply formatting', 'Aplicar formato'],
	strip: ['Remover máscara', 'Remove formatting', 'Quitar formato'],
	barcode: ['Código de barras', 'Barcode', 'Código de barras'],
	line: ['Linha digitável', 'Payment line', 'Línea de pago'],
	exact: ['Comparação exata', 'Exact comparison', 'Comparación exacta'],
	trim: ['Ignorar espaços externos', 'Ignore surrounding whitespace', 'Ignorar espacios externos'],
	'ignore-case': [
		'Ignorar maiúsculas e minúsculas',
		'Ignore case',
		'Ignorar mayúsculas y minúsculas',
	],
	ascending: ['Ordem crescente', 'Ascending order', 'Orden ascendente'],
	descending: ['Ordem decrescente', 'Descending order', 'Orden descendente'],
	numeric: ['Ordem numérica', 'Numeric order', 'Orden numérico'],
	'ticks-to-iso': ['Ticks para ISO', 'Ticks to ISO', 'Ticks a ISO'],
	'iso-to-ticks': ['ISO para ticks', 'ISO to ticks', 'ISO a ticks'],
	regular: ['String regular', 'Regular string', 'Cadena regular'],
	verbatim: ['String verbatim', 'Verbatim string', 'Cadena verbatim'],
	pascal: ['PascalCase', 'PascalCase', 'PascalCase'],
	camel: ['camelCase', 'camelCase', 'camelCase'],
};

export const mode = (options: readonly string[]): ToolControl =>
	select(
		'mode',
		'Operação',
		'Operation',
		options.map((value) => {
			const labels = operations[value] ?? [value, value, value];
			return [value, labels[0], labels[1], labels[2]];
		}),
	);
