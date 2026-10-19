import { text } from '@app/core/models/tool';
import type { ToolRegistration } from '@app/features/tools/catalog/tool-registration';

export const CONVERTERS_TOOLS: readonly ToolRegistration[] = [
	{
		id: 'base64',
		name: text('Base64 Encoder / Decoder', 'Base64 Encoder / Decoder', undefined, 'tools.base64'),
		description: text(
			'Codifique e decodifique texto, incluindo Unicode.',
			'Encode and decode text, including Unicode.',
			undefined,
			'tools.base64',
		),
		category: 'converters',
		icon: 'arrows',
		keywords: 'encode decode encoding codificar decodificar',
		available: true,
		popular: true,
		loadDefinition: () => import('../converters/base64.tool').then((module) => module.definition),
	},
	{
		id: 'url',
		name: text('URL Encoder / Decoder', 'URL Encoder / Decoder', undefined, 'tools.url'),
		description: text(
			'Converta caracteres em componentes de URL.',
			'Convert characters in URL components.',
			undefined,
			'tools.url',
		),
		category: 'converters',
		icon: 'link',
		keywords: 'uri percent encoding escape componente',
		available: true,
		loadDefinition: () => import('../converters/url.tool').then((module) => module.definition),
	},
	{
		id: 'timestamp',
		name: text('Unix Timestamp', 'Unix Timestamp', undefined, 'tools.timestamp'),
		description: text(
			'Converta datas, segundos e milissegundos.',
			'Convert dates, seconds and milliseconds.',
			undefined,
			'tools.timestamp',
		),
		category: 'converters',
		icon: 'clock',
		keywords: 'date time data hora epoch timezone',
		available: true,
		loadDefinition: () =>
			import('../converters/timestamp.tool').then((module) => module.definition),
	},
	{
		id: 'html-entities',
		category: 'converters',
		name: text(
			'HTML Entities Encode/Decode',
			'HTML Entities Encode/Decode',
			undefined,
			'tools.html-entities',
		),
		description: text(
			'Codifique ou decodifique entidades HTML no texto.',
			'Encode or decode HTML entities in text.',
			'Codifica o decodifica entidades HTML en texto.',
			'tools.html-entities',
		),
		icon: 'code',
		keywords: '',
		available: true,

		loadDefinition: () =>
			import('../converters/html-entities.tool').then((module) => module.definition),
	},
	{
		id: 'unicode',
		category: 'converters',
		name: text('Unicode Converter', 'Unicode Converter', undefined, 'tools.unicode'),
		description: text(
			'Converta caracteres em escapes Unicode e vice-versa.',
			'Convert characters to Unicode escapes and back.',
			'Convierte caracteres a escapes Unicode y viceversa.',
			'tools.unicode',
		),
		icon: 'code',
		keywords: '',
		available: true,

		loadDefinition: () => import('../converters/unicode.tool').then((module) => module.definition),
	},
	{
		id: 'hex',
		category: 'converters',
		name: text('Hexadecimal Converter', 'Hexadecimal Converter', undefined, 'tools.hex'),
		description: text(
			'Converta texto UTF-8 em hexadecimal e vice-versa.',
			'Convert UTF-8 text to hexadecimal and back.',
			'Convierte texto UTF-8 a hexadecimal y viceversa.',
			'tools.hex',
		),
		icon: 'code',
		keywords: '',
		available: true,

		loadDefinition: () => import('../converters/hex.tool').then((module) => module.definition),
	},
	{
		id: 'base-converter',
		category: 'converters',
		name: text(
			'Binário / Decimal / Hexadecimal',
			'Binary / Decimal / Hexadecimal',
			undefined,
			'tools.base-converter',
		),
		description: text(
			'Converta inteiros entre bases binária, decimal e hexadecimal.',
			'Convert integers between binary, decimal and hexadecimal.',
			'Convierte enteros entre binario, decimal y hexadecimal.',
			'tools.base-converter',
		),
		icon: 'code',
		keywords: '',
		available: true,

		loadDefinition: () =>
			import('../converters/base-converter.tool').then((module) => module.definition),
	},
	{
		id: 'date',
		category: 'converters',
		name: text('Date Converter', 'Date Converter', undefined, 'tools.date'),
		description: text(
			'Converta datas ISO, brasileiras, americanas e Unix.',
			'Convert ISO, Brazilian, US and Unix dates.',
			'Convierte fechas ISO, brasileñas, estadounidenses y Unix.',
			'tools.date',
		),
		icon: 'code',
		keywords: '',
		available: true,

		loadDefinition: () => import('../converters/date.tool').then((module) => module.definition),
	},
	{
		id: 'timezone',
		category: 'converters',
		name: text('Timezone Converter', 'Timezone Converter', undefined, 'tools.timezone'),
		description: text(
			'Converta data e hora entre fusos IANA.',
			'Convert a local date and time between IANA timezones.',
			'Convierte fecha y hora entre zonas IANA.',
			'tools.timezone',
		),
		icon: 'code',
		keywords: '',
		available: true,

		loadDefinition: () => import('../converters/timezone.tool').then((module) => module.definition),
	},
	{
		id: 'text-binary',
		category: 'converters',
		name: text('Text to Binary', 'Text to Binary', undefined, 'tools.text-binary'),
		description: text(
			'Converta texto UTF-8 em sequências de bytes binários.',
			'Convert UTF-8 text to sequences of binary bytes.',
			'Convierte texto UTF-8 en secuencias de bytes binarios.',
			'tools.text-binary',
		),
		icon: 'code',
		keywords: '',
		available: true,

		loadDefinition: () =>
			import('../converters/text-binary.tool').then((module) => module.definition),
	},
	{
		id: 'binary-text',
		category: 'converters',
		name: text('Binary to Text', 'Binary to Text', undefined, 'tools.binary-text'),
		description: text(
			'Decodifique bytes binários em texto UTF-8.',
			'Decode binary bytes into UTF-8 text.',
			'Decodifica bytes binarios como texto UTF-8.',
			'tools.binary-text',
		),
		icon: 'code',
		keywords: '',
		available: true,

		loadDefinition: () =>
			import('../converters/binary-text.tool').then((module) => module.definition),
	},
	{
		id: 'markdown',
		category: 'converters',
		name: text('Markdown Preview', 'Markdown Preview', undefined, 'tools.markdown'),
		description: text(
			'Veja uma prévia de Markdown sem executar scripts.',
			'Preview Markdown without executing scripts.',
			'Previsualiza Markdown sin ejecutar scripts.',
			'tools.markdown',
		),
		icon: 'code',
		keywords: '',
		available: true,

		loadDefinition: () => import('../converters/markdown.tool').then((module) => module.definition),
	},
	{
		id: 'punycode',
		category: 'converters',
		name: text('Punycode Converter', 'Punycode Converter', undefined, 'tools.punycode'),
		description: text(
			'Converta nomes de domínio Unicode e Punycode.',
			'Convert domain names between Unicode and Punycode.',
			'Convierte nombres de dominio entre Unicode y Punycode.',
			'tools.punycode',
		),
		icon: 'code',
		keywords: '',
		available: true,

		loadDefinition: () => import('../converters/punycode.tool').then((module) => module.definition),
	},
];
