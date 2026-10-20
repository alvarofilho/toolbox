import type { ToolRegistration } from '@app/features/tools/catalog/tool-registration';

export const CONVERTERS_TOOLS: readonly ToolRegistration[] = [
	{
		id: 'base64',
		name: 'tools.base64.base64_encoder_decoder',
		description: 'tools.base64.encode_and_decode_text_including_unicode',
		category: 'converters',
		icon: 'arrows',
		keywords: 'encode decode encoding codificar decodificar',
		available: true,
		popular: true,
		loadDefinition: () => import('../converters/base64.tool').then((module) => module.definition),
	},
	{
		id: 'url',
		name: 'tools.url.url_encoder_decoder',
		description: 'tools.url.convert_characters_in_url_components',
		category: 'converters',
		icon: 'link',
		keywords: 'uri percent encoding escape componente',
		available: true,
		loadDefinition: () => import('../converters/url.tool').then((module) => module.definition),
	},
	{
		id: 'timestamp',
		name: 'tools.timestamp.unix_timestamp',
		description: 'tools.timestamp.convert_dates_seconds_and_milliseconds',
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
		name: 'tools.html-entities.html_entities_encode_decode',
		description: 'tools.html-entities.encode_or_decode_html_entities_in_text',
		icon: 'code',
		keywords: '',
		available: true,

		loadDefinition: () =>
			import('../converters/html-entities.tool').then((module) => module.definition),
	},
	{
		id: 'unicode',
		category: 'converters',
		name: 'tools.unicode.unicode_converter',
		description: 'tools.unicode.convert_characters_to_unicode_escapes_and_',
		icon: 'code',
		keywords: '',
		available: true,

		loadDefinition: () => import('../converters/unicode.tool').then((module) => module.definition),
	},
	{
		id: 'hex',
		category: 'converters',
		name: 'tools.hex.hexadecimal_converter',
		description: 'tools.hex.convert_utf_8_text_to_hexadecimal_and_back',
		icon: 'code',
		keywords: '',
		available: true,

		loadDefinition: () => import('../converters/hex.tool').then((module) => module.definition),
	},
	{
		id: 'base-converter',
		category: 'converters',
		name: 'tools.base-converter.binary_decimal_hexadecimal',
		description: 'tools.base-converter.convert_integers_between_binary_decimal_an',
		icon: 'code',
		keywords: '',
		available: true,

		loadDefinition: () =>
			import('../converters/base-converter.tool').then((module) => module.definition),
	},
	{
		id: 'date',
		category: 'converters',
		name: 'tools.date.date_converter',
		description: 'tools.date.convert_iso_brazilian_us_and_unix_dates',
		icon: 'code',
		keywords: '',
		available: true,

		loadDefinition: () => import('../converters/date.tool').then((module) => module.definition),
	},
	{
		id: 'timezone',
		category: 'converters',
		name: 'tools.timezone.timezone_converter',
		description: 'tools.timezone.convert_a_local_date_and_time_between_iana',
		icon: 'code',
		keywords: '',
		available: true,

		loadDefinition: () => import('../converters/timezone.tool').then((module) => module.definition),
	},
	{
		id: 'text-binary',
		category: 'converters',
		name: 'tools.text-binary.text_to_binary',
		description: 'tools.text-binary.convert_utf_8_text_to_sequences_of_binary_',
		icon: 'code',
		keywords: '',
		available: true,

		loadDefinition: () =>
			import('../converters/text-binary.tool').then((module) => module.definition),
	},
	{
		id: 'binary-text',
		category: 'converters',
		name: 'tools.binary-text.binary_to_text',
		description: 'tools.binary-text.decode_binary_bytes_into_utf_8_text',
		icon: 'code',
		keywords: '',
		available: true,

		loadDefinition: () =>
			import('../converters/binary-text.tool').then((module) => module.definition),
	},
	{
		id: 'markdown',
		category: 'converters',
		name: 'tools.markdown.markdown_preview',
		description: 'tools.markdown.preview_markdown_without_executing_scripts',
		icon: 'code',
		keywords: '',
		available: true,

		loadDefinition: () => import('../converters/markdown.tool').then((module) => module.definition),
	},
	{
		id: 'punycode',
		category: 'converters',
		name: 'tools.punycode.punycode_converter',
		description: 'tools.punycode.convert_domain_names_between_unicode_and_p',
		icon: 'code',
		keywords: '',
		available: true,

		loadDefinition: () => import('../converters/punycode.tool').then((module) => module.definition),
	},
];
