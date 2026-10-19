import { text } from '@app/core/models/tool';
import type { ToolRegistration } from '@app/features/tools/catalog/tool-registration';

export const DEVELOPMENT_TOOLS: readonly ToolRegistration[] = [
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
		loadDefinition: () => import('../development/regex.tool').then((module) => module.definition),
	},
	{
		id: 'sql-formatter',
		category: 'development',
		name: text('SQL Formatter', 'SQL Formatter'),
		description: text(
			'Organize SQL com indentação no dialeto escolhido.',
			'Format SQL with indentation in your chosen dialect.',
			'Organiza SQL con sangría en el dialecto elegido.',
		),
		icon: 'code',
		keywords: '',
		available: true,

		loadDefinition: () =>
			import('../development/sql-formatter.tool').then((module) => module.definition),
	},
	{
		id: 'xml-formatter',
		category: 'development',
		name: text('XML Formatter', 'XML Formatter'),
		description: text(
			'Formate XML com indentação e verifique a boa formação.',
			'Format XML with indentation and check well-formedness.',
			'Formatea XML con sangría y comprueba su buena formación.',
		),
		icon: 'code',
		keywords: '',
		available: true,

		loadDefinition: () =>
			import('../development/xml-formatter.tool').then((module) => module.definition),
	},
	{
		id: 'xml-validator',
		category: 'development',
		name: text('XML Validator', 'XML Validator'),
		description: text(
			'Confira a boa formação de XML, sem validação XSD.',
			'Check XML well-formedness without XSD validation.',
			'Comprueba la buena formación de XML, sin validación XSD.',
		),
		icon: 'code',
		keywords: '',
		available: true,

		loadDefinition: () =>
			import('../development/xml-validator.tool').then((module) => module.definition),
	},
	{
		id: 'yaml-formatter',
		category: 'development',
		name: text('YAML Formatter', 'YAML Formatter'),
		description: text(
			'Organize a indentação de um documento YAML.',
			'Format the indentation of a YAML document.',
			'Organiza la sangría de un documento YAML.',
		),
		icon: 'code',
		keywords: '',
		available: true,

		loadDefinition: () =>
			import('../development/yaml-formatter.tool').then((module) => module.definition),
	},
	{
		id: 'cron-builder',
		category: 'development',
		name: text('Cron Expression Builder', 'Cron Expression Builder'),
		description: text(
			'Monte uma expressão cron e veja as próximas execuções.',
			'Build a cron expression and see its next occurrences.',
			'Crea una expresión cron y consulta sus próximas ejecuciones.',
		),
		icon: 'code',
		keywords: '',
		available: true,

		loadDefinition: () =>
			import('../development/cron-builder.tool').then((module) => module.definition),
	},
	{
		id: 'cron-parser',
		category: 'development',
		name: text('Cron Expression Parser', 'Cron Expression Parser'),
		description: text(
			'Interprete uma expressão cron com datas no fuso escolhido.',
			'Interpret a cron expression in your chosen timezone.',
			'Interpreta una expresión cron en la zona horaria elegida.',
		),
		icon: 'code',
		keywords: '',
		available: true,

		loadDefinition: () =>
			import('../development/cron-parser.tool').then((module) => module.definition),
	},
	{
		id: 'http-status',
		category: 'development',
		name: text('HTTP Status Explorer', 'HTTP Status Explorer'),
		description: text(
			'Consulte o nome e o significado de códigos HTTP.',
			'Look up HTTP status names and meanings.',
			'Consulta nombres y significados de códigos HTTP.',
		),
		icon: 'code',
		keywords: '',
		available: true,

		loadDefinition: () =>
			import('../development/http-status.tool').then((module) => module.definition),
	},
	{
		id: 'http-headers',
		category: 'development',
		name: text('HTTP Header Analyzer', 'HTTP Header Analyzer'),
		description: text(
			'Analise cabeçalhos HTTP colados de uma resposta.',
			'Inspect HTTP headers pasted from a response.',
			'Analiza encabezados HTTP pegados de una respuesta.',
		),
		icon: 'code',
		keywords: '',
		available: true,

		loadDefinition: () =>
			import('../development/http-headers.tool').then((module) => module.definition),
	},
	{
		id: 'url-parser',
		category: 'development',
		name: text('URL Parser', 'URL Parser'),
		description: text(
			'Separe protocolo, domínio, caminho e parâmetros de uma URL.',
			'Split a URL into protocol, host, path and parameters.',
			'Separa protocolo, dominio, ruta y parámetros de una URL.',
		),
		icon: 'code',
		keywords: '',
		available: true,

		loadDefinition: () =>
			import('../development/url-parser.tool').then((module) => module.definition),
	},
	{
		id: 'curl',
		category: 'development',
		name: text('cURL Generator', 'cURL Generator'),
		description: text(
			'Gere um comando cURL com método, cabeçalhos e corpo.',
			'Generate a cURL command with method, headers and body.',
			'Genera un comando cURL con método, encabezados y cuerpo.',
		),
		icon: 'code',
		keywords: '',
		available: true,

		loadDefinition: () => import('../development/curl.tool').then((module) => module.definition),
	},
	{
		id: 'json-patch',
		category: 'development',
		name: text('JSON Patch Builder', 'JSON Patch Builder'),
		description: text(
			'Compare dois documentos JSON e gere operações JSON Patch.',
			'Compare two JSON documents and generate JSON Patch operations.',
			'Compara dos documentos JSON y genera operaciones JSON Patch.',
		),
		icon: 'code',
		keywords: '',
		available: true,

		loadDefinition: () =>
			import('../development/json-patch.tool').then((module) => module.definition),
	},
	{
		id: 'openapi',
		category: 'development',
		name: text('OpenAPI Viewer', 'OpenAPI Viewer'),
		description: text(
			'Explore operações e caminhos de um documento OpenAPI ou Swagger.',
			'Explore operations and paths in OpenAPI or Swagger.',
			'Explora operaciones y rutas de OpenAPI o Swagger.',
		),
		icon: 'code',
		keywords: '',
		available: true,

		loadDefinition: () => import('../development/openapi.tool').then((module) => module.definition),
	},
	{
		id: 'openapi-diff',
		category: 'development',
		name: text('OpenAPI Diff', 'OpenAPI Diff'),
		description: text(
			'Encontre mudanças entre duas versões de uma especificação OpenAPI.',
			'Find changes between two versions of an OpenAPI specification.',
			'Encuentra cambios entre dos versiones de una especificación OpenAPI.',
		),
		icon: 'code',
		keywords: '',
		available: true,

		loadDefinition: () =>
			import('../development/openapi-diff.tool').then((module) => module.definition),
	},
	{
		id: 'graphql',
		category: 'development',
		name: text('GraphQL Formatter', 'GraphQL Formatter'),
		description: text(
			'Formate consultas e documentos GraphQL.',
			'Format GraphQL queries and documents.',
			'Formatea consultas y documentos GraphQL.',
		),
		icon: 'code',
		keywords: '',
		available: true,

		loadDefinition: () => import('../development/graphql.tool').then((module) => module.definition),
	},
	{
		id: 'semver',
		category: 'development',
		name: text('Semantic Version Comparator', 'Semantic Version Comparator'),
		description: text(
			'Compare versões semânticas e confira intervalos de compatibilidade.',
			'Compare semantic versions and check version ranges.',
			'Compara versiones semánticas y comprueba intervalos de versiones.',
		),
		icon: 'code',
		keywords: '',
		available: true,

		loadDefinition: () => import('../development/semver.tool').then((module) => module.definition),
	},
];
