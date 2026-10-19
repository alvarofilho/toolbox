import { text, type Localized, type ToolInfo } from '@app/core/models/tool';
import { EXTENDED_TOOLS } from '@app/core/registry/extended-tools';

export const CATEGORIES = [
	{ id: 'json', name: text('JSON e dados', 'JSON & data'), icon: 'braces' },
	{
		id: 'converters',
		name: text('Codificação e conversores', 'Encoding & converters'),
		icon: 'arrows',
	},
	{ id: 'generators', name: text('Geradores', 'Generators'), icon: 'spark' },
	{
		id: 'security',
		name: text('Criptografia e segurança', 'Cryptography & security'),
		icon: 'shield',
	},
	{ id: 'development', name: text('Desenvolvimento', 'Development'), icon: 'code' },
	{ id: 'utilities', name: text('Utilitários gerais', 'General utilities'), icon: 'spark' },
	{ id: 'text', name: text('Texto', 'Text'), icon: 'type' },
	{ id: 'brazilian', name: text('Ferramentas brasileiras', 'Brazilian tools'), icon: 'document' },
	{ id: 'mercosur', name: text('Mercosul', 'Mercosur'), icon: 'document' },
	{ id: 'database', name: text('Banco de dados e .NET', 'Databases & .NET'), icon: 'building' },
	{
		id: 'infrastructure',
		name: text('Redes e infraestrutura', 'Networks & infrastructure'),
		icon: 'link',
	},
	{ id: 'frontend', name: text('CSS e frontend', 'CSS & frontend'), icon: 'grid' },
] as const;
export const TOOLS: readonly ToolInfo[] = [
	{
		id: 'json-formatter',
		name: text('JSON Formatter', 'JSON Formatter'),
		description: text(
			'Formate, organize e valide seus dados JSON.',
			'Format, organize and validate your JSON data.',
		),
		category: 'json',
		icon: 'braces',
		keywords: 'pretty print validar formatar identar objeto',
		available: true,
		popular: true,
	},
	{
		id: 'json-minifier',
		name: text('JSON Minifier', 'JSON Minifier'),
		description: text(
			'Remova espaços e reduza o tamanho do JSON.',
			'Remove whitespace and reduce JSON size.',
		),
		category: 'json',
		icon: 'compress',
		keywords: 'compactar minify comprimir',
		available: true,
	},
	{
		id: 'json-diff',
		name: text('JSON Diff', 'JSON Diff'),
		description: text(
			'Compare estruturas e encontre o que mudou.',
			'Compare structures and find what changed.',
		),
		category: 'json',
		icon: 'diff',
		keywords: 'diferença comparar difference',
		available: true,
	},
	{
		id: 'base64',
		name: text('Base64 Encoder / Decoder', 'Base64 Encoder / Decoder'),
		description: text(
			'Codifique e decodifique texto, incluindo Unicode.',
			'Encode and decode text, including Unicode.',
		),
		category: 'converters',
		icon: 'arrows',
		keywords: 'encode decode encoding codificar decodificar',
		available: true,
		popular: true,
	},
	{
		id: 'url',
		name: text('URL Encoder / Decoder', 'URL Encoder / Decoder'),
		description: text(
			'Converta caracteres em componentes de URL.',
			'Convert characters in URL components.',
		),
		category: 'converters',
		icon: 'link',
		keywords: 'uri percent encoding escape componente',
		available: true,
	},
	{
		id: 'uuid',
		name: text('Gerador de UUID', 'UUID Generator'),
		description: text(
			'Crie identificadores únicos nas versões 4 e 7.',
			'Create unique version 4 and 7 identifiers.',
		),
		category: 'generators',
		icon: 'fingerprint',
		keywords: 'guid uuidv4 uuidv7 id random',
		available: true,
		popular: true,
	},
	{
		id: 'password',
		name: text('Gerador de senhas', 'Password Generator'),
		description: text(
			'Gere senhas fortes com as suas regras.',
			'Generate strong passwords with your rules.',
		),
		category: 'generators',
		icon: 'key',
		keywords: 'senha password segura aleatorio secure',
		available: true,
		popular: true,
	},
	{
		id: 'token',
		name: text('Gerador de tokens e chaves', 'Secure Token and Key Generator'),
		description: text(
			'Gere tokens, segredos e chaves com entropia criptográfica.',
			'Generate tokens, secrets and keys with cryptographic entropy.',
		),
		category: 'generators',
		icon: 'hash',
		keywords: 'secret token key chave criptografica hexadecimal hex base64 random seguro',
		available: true,
	},
	{
		id: 'timestamp',
		name: text('Unix Timestamp', 'Unix Timestamp'),
		description: text(
			'Converta datas, segundos e milissegundos.',
			'Convert dates, seconds and milliseconds.',
		),
		category: 'converters',
		icon: 'clock',
		keywords: 'date time data hora epoch timezone',
		available: true,
	},
	{
		id: 'jwt',
		name: text('JWT Decoder', 'JWT Decoder'),
		description: text(
			'Inspecione o header e os claims de um token.',
			'Inspect token headers and claims.',
		),
		category: 'security',
		icon: 'scan',
		keywords: 'jwt token json web header claims auth',
		available: true,
		popular: true,
	},
	{
		id: 'sha',
		name: text('Gerador de hash SHA', 'SHA Hash Generator'),
		description: text(
			'Calcule hashes SHA-256 e SHA-512 localmente.',
			'Calculate SHA-256 and SHA-512 hashes locally.',
		),
		category: 'security',
		icon: 'shield',
		keywords: 'hash digest checksum sha256 sha512',
		available: true,
	},
	{
		id: 'regex',
		name: text('Regex Tester', 'Regex Tester'),
		description: text(
			'Teste expressões regulares e explore resultados.',
			'Test regular expressions and explore matches.',
		),
		category: 'development',
		icon: 'regex',
		keywords: 'regexp expressão regular pattern match',
		available: true,
		popular: true,
	},
	{
		id: 'text-diff',
		name: text('Text Diff', 'Text Diff'),
		description: text(
			'Veja diferenças entre duas versões de um texto.',
			'See differences between two versions of text.',
		),
		category: 'text',
		icon: 'diff',
		keywords: 'comparar diferença texto linhas',
		available: true,
	},
	{
		id: 'case',
		name: text('Conversor de texto', 'Case Converter'),
		description: text(
			'Alterne entre camelCase, snake_case e mais.',
			'Switch between camelCase, snake_case and more.',
		),
		category: 'text',
		icon: 'type',
		keywords: 'case maiúsculas minúsculas pascal kebab slug',
		available: true,
	},
	{
		id: 'cpf',
		name: text('Gerador e validador de CPF', 'CPF Generator & Validator'),
		description: text(
			'Gere CPFs para testes e valide seus dígitos.',
			'Generate test CPFs and validate check digits.',
		),
		category: 'brazilian',
		icon: 'document',
		keywords: 'brasil documento pessoa fisica brazil',
		available: true,
	},
	{
		id: 'cnpj',
		name: text('Gerador e validador de CNPJ', 'CNPJ Generator & Validator'),
		description: text(
			'CNPJ numérico e alfanumérico, prontos para testes.',
			'Numeric and alphanumeric CNPJ for testing.',
		),
		category: 'brazilian',
		icon: 'building',
		keywords: 'brasil empresa juridica alfanumerico brazil',
		available: true,
		isNew: true,
	},
	{
		id: 'person',
		name: text('Gerador de pessoas', 'Fake Person Generator'),
		description: text(
			'Dados brasileiros sintéticos em JSON, CSV ou SQL.',
			'Synthetic Brazilian data in JSON, CSV or SQL.',
		),
		category: 'brazilian',
		icon: 'users',
		keywords: 'fake faker pessoa massa seed brasileiro email telefone',
		available: true,
		isNew: true,
	},
	{
		id: 'json-yaml',
		name: text('JSON ↔ YAML', 'JSON ↔ YAML'),
		description: text(
			'Converta dados entre JSON e YAML sem esforço.',
			'Convert data between JSON and YAML with ease.',
		),
		category: 'json',
		icon: 'file-code',
		keywords: 'yml converter serialize deserializar',
		available: true,
		isNew: true,
	},
	...EXTENDED_TOOLS,
];
export function findTools(
	query: string,
	translate: (value: Localized) => string = (value) => `${value.pt} ${value.en}`,
): readonly ToolInfo[] {
	const normalize = (value: string): string =>
		value
			.normalize('NFD')
			.replace(/[\u0300-\u036f]/g, '')
			.toLowerCase();
	const words = normalize(query).trim().split(/\s+/);
	return TOOLS.filter((tool) => {
		if (!tool.available) {
			return false;
		}
		const category = CATEGORIES.find((item) => item.id === tool.category);
		const searchable = normalize(
			`${tool.name.pt} ${tool.name.en} ${translate(tool.name)} ${tool.description.pt} ${tool.description.en} ${translate(tool.description)} ${tool.keywords} ${category?.name.pt ?? ''} ${category?.name.en ?? ''} ${category ? translate(category.name) : ''}`,
		);
		return words.every((word) => searchable.includes(word));
	});
}
