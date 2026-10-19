import { text } from '@app/core/models/tool';
import type { ToolRegistration } from '@app/features/tools/catalog/tool-registration';

export const GENERATORS_TOOLS: readonly ToolRegistration[] = [
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
		loadDefinition: () => import('../generators/uuid.tool').then((module) => module.definition),
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
		loadDefinition: () => import('../generators/password.tool').then((module) => module.definition),
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
		loadDefinition: () => import('../generators/token.tool').then((module) => module.definition),
	},
	{
		id: 'company',
		category: 'generators',
		name: text('Gerador de empresas', 'Company Generator'),
		description: text(
			'Gere empresas fictícias com CNPJ em JSON, CSV ou SQL.',
			'Generate fictional companies with CNPJ as JSON, CSV or SQL.',
			'Genera empresas ficticias con CNPJ en JSON, CSV o SQL.',
		),
		icon: 'spark',
		keywords: '',
		available: true,

		loadDefinition: () => import('../generators/company.tool').then((module) => module.definition),
	},
	{
		id: 'address',
		category: 'generators',
		name: text('Gerador de endereços', 'Address Generator'),
		description: text(
			'Gere endereços sintéticos com UF em JSON, CSV ou SQL.',
			'Generate synthetic addresses by state as JSON, CSV or SQL.',
			'Genera direcciones sintéticas por estado en JSON, CSV o SQL.',
		),
		icon: 'spark',
		keywords: '',
		available: true,

		loadDefinition: () => import('../generators/address.tool').then((module) => module.definition),
	},
	{
		id: 'email',
		category: 'generators',
		name: text('Gerador de e-mails', 'Email Generator'),
		description: text(
			'Crie e-mails de teste com o domínio example.com.',
			'Create test email addresses using example.com.',
			'Crea correos de prueba con el dominio example.com.',
		),
		icon: 'spark',
		keywords: '',
		available: true,

		loadDefinition: () => import('../generators/email.tool').then((module) => module.definition),
	},
	{
		id: 'phone',
		category: 'generators',
		name: text('Gerador de telefones', 'Phone Generator'),
		description: text(
			'Gere telefones fictícios com o DDD escolhido.',
			'Generate fictional phone numbers with your chosen area code.',
			'Genera teléfonos ficticios con el prefijo elegido.',
		),
		icon: 'spark',
		keywords: '',
		available: true,

		loadDefinition: () => import('../generators/phone.tool').then((module) => module.definition),
	},
	{
		id: 'ulid',
		category: 'generators',
		name: text('Gerador de ULID', 'ULID Generator'),
		description: text(
			'Crie identificadores ULID ordenáveis por tempo.',
			'Create time-sortable ULID identifiers.',
			'Crea identificadores ULID ordenables por tiempo.',
		),
		icon: 'spark',
		keywords: '',
		available: true,

		loadDefinition: () => import('../generators/ulid.tool').then((module) => module.definition),
	},
	{
		id: 'guid',
		category: 'generators',
		name: text('Gerador de GUID', 'GUID Generator'),
		description: text(
			'Gere uma lista de identificadores GUID aleatórios.',
			'Generate a list of random GUID identifiers.',
			'Genera una lista de identificadores GUID aleatorios.',
		),
		icon: 'spark',
		keywords: '',
		available: true,

		loadDefinition: () => import('../generators/guid.tool').then((module) => module.definition),
	},
	{
		id: 'random-date',
		category: 'generators',
		name: text('Gerador de datas aleatórias', 'Random Date Generator'),
		description: text(
			'Gere datas aleatórias dentro de um intervalo ISO.',
			'Generate random dates within an ISO date range.',
			'Genera fechas aleatorias dentro de un intervalo ISO.',
		),
		icon: 'spark',
		keywords: '',
		available: true,

		loadDefinition: () =>
			import('../generators/random-date.tool').then((module) => module.definition),
	},
	{
		id: 'lorem',
		category: 'generators',
		name: text('Gerador de Lorem Ipsum', 'Lorem Ipsum Generator'),
		description: text(
			'Gere parágrafos de texto para protótipos e testes.',
			'Generate placeholder paragraphs for prototypes and tests.',
			'Genera párrafos de relleno para prototipos y pruebas.',
		),
		icon: 'spark',
		keywords: '',
		available: true,

		loadDefinition: () => import('../generators/lorem.tool').then((module) => module.definition),
	},
	{
		id: 'qr',
		category: 'generators',
		name: text('Gerador de QR Code', 'QR Code Generator'),
		description: text(
			'Transforme texto ou URL em um QR Code SVG.',
			'Turn text or a URL into an SVG QR Code.',
			'Convierte texto o una URL en un código QR SVG.',
		),
		icon: 'spark',
		keywords: '',
		available: true,

		loadDefinition: () => import('../generators/qr.tool').then((module) => module.definition),
	},
	{
		id: 'data-generator',
		category: 'generators',
		name: text('Gerador de massa de dados', 'Test Data Generator'),
		description: text(
			'Defina campos e tipos para gerar registros em JSON, CSV ou SQL.',
			'Define fields and types to generate JSON, CSV or SQL records.',
			'Define campos y tipos para generar registros JSON, CSV o SQL.',
		),
		icon: 'spark',
		keywords: '',
		available: true,

		loadDefinition: () =>
			import('../generators/data-generator.tool').then((module) => module.definition),
	},
];
