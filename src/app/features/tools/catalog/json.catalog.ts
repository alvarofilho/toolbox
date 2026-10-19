import { text } from '@app/core/models/tool';
import type { ToolRegistration } from '@app/features/tools/catalog/tool-registration';

export const JSON_TOOLS: readonly ToolRegistration[] = [
	{
		id: 'json-formatter',
		name: text('JSON Formatter', 'JSON Formatter', undefined, 'tools.json-formatter'),
		description: text(
			'Formate, organize e valide seus dados JSON.',
			'Format, organize and validate your JSON data.',
			undefined,
			'tools.json-formatter',
		),
		category: 'json',
		icon: 'braces',
		keywords: 'pretty print validar formatar identar objeto',
		available: true,
		popular: true,
		loadDefinition: () => import('../json/json-formatter.tool').then((module) => module.definition),
	},
	{
		id: 'json-minifier',
		name: text('JSON Minifier', 'JSON Minifier', undefined, 'tools.json-minifier'),
		description: text(
			'Remova espaços e reduza o tamanho do JSON.',
			'Remove whitespace and reduce JSON size.',
			undefined,
			'tools.json-minifier',
		),
		category: 'json',
		icon: 'compress',
		keywords: 'compactar minify comprimir',
		available: true,
		loadDefinition: () => import('../json/json-minifier.tool').then((module) => module.definition),
	},
	{
		id: 'json-diff',
		name: text('JSON Diff', 'JSON Diff', undefined, 'tools.json-diff'),
		description: text(
			'Compare estruturas e encontre o que mudou.',
			'Compare structures and find what changed.',
			undefined,
			'tools.json-diff',
		),
		category: 'json',
		icon: 'diff',
		keywords: 'diferença comparar difference',
		available: true,
		loadDefinition: () => import('../json/json-diff.tool').then((module) => module.definition),
	},
	{
		id: 'json-yaml',
		name: text('JSON ↔ YAML', 'JSON ↔ YAML', undefined, 'tools.json-yaml'),
		description: text(
			'Converta dados entre JSON e YAML sem esforço.',
			'Convert data between JSON and YAML with ease.',
			undefined,
			'tools.json-yaml',
		),
		category: 'json',
		icon: 'file-code',
		keywords: 'yml converter serialize deserializar',
		available: true,

		loadDefinition: () => import('../json/json-yaml.tool').then((module) => module.definition),
	},
	{
		id: 'json-validator',
		category: 'json',
		name: text('JSON Validator', 'JSON Validator', undefined, 'tools.json-validator'),
		description: text(
			'Confira se a sintaxe de um documento JSON é válida.',
			'Check whether a JSON document has valid syntax.',
			'Comprueba si un documento JSON tiene sintaxis válida.',
			'tools.json-validator',
		),
		icon: 'code',
		keywords: '',
		available: true,

		loadDefinition: () => import('../json/json-validator.tool').then((module) => module.definition),
	},
	{
		id: 'json-viewer',
		category: 'json',
		name: text('JSON Viewer', 'JSON Viewer', undefined, 'tools.json-viewer'),
		description: text(
			'Explore objetos e listas JSON em uma árvore expansível.',
			'Explore JSON objects and arrays in an expandable tree.',
			'Explora objetos y listas JSON en un árbol desplegable.',
			'tools.json-viewer',
		),
		icon: 'code',
		keywords: '',
		available: true,

		loadDefinition: () => import('../json/json-viewer.tool').then((module) => module.definition),
	},
	{
		id: 'jsonpath',
		category: 'json',
		name: text('JSONPath Tester', 'JSONPath Tester', undefined, 'tools.jsonpath'),
		description: text(
			'Extraia valores de um documento JSON usando JSONPath.',
			'Extract values from a JSON document using JSONPath.',
			'Extrae valores de un documento JSON con JSONPath.',
			'tools.jsonpath',
		),
		icon: 'code',
		keywords: '',
		available: true,

		loadDefinition: () => import('../json/jsonpath.tool').then((module) => module.definition),
	},
	{
		id: 'json-schema',
		category: 'json',
		name: text('JSON Schema Validator', 'JSON Schema Validator', undefined, 'tools.json-schema'),
		description: text(
			'Valide dados JSON contra um schema Draft 7.',
			'Validate JSON data against a Draft 7 schema.',
			'Valida datos JSON frente a un schema Draft 7.',
			'tools.json-schema',
		),
		icon: 'code',
		keywords: '',
		available: true,

		loadDefinition: () => import('../json/json-schema.tool').then((module) => module.definition),
	},
	{
		id: 'json-typescript',
		category: 'json',
		name: text('JSON para TypeScript', 'JSON to TypeScript', undefined, 'tools.json-typescript'),
		description: text(
			'Transforme objetos JSON em tipos TypeScript.',
			'Turn JSON objects into TypeScript types.',
			'Convierte objetos JSON en tipos TypeScript.',
			'tools.json-typescript',
		),
		icon: 'code',
		keywords: '',
		available: true,

		loadDefinition: () =>
			import('../json/json-typescript.tool').then((module) => module.definition),
	},
	{
		id: 'json-csharp-interface',
		category: 'json',
		name: text(
			'JSON para interfaces C#',
			'JSON to C# Interfaces',
			undefined,
			'tools.json-csharp-interface',
		),
		description: text(
			'Transforme objetos JSON em interfaces C#.',
			'Turn JSON objects into C# interfaces.',
			'Convierte objetos JSON en interfaces C#.',
			'tools.json-csharp-interface',
		),
		icon: 'code',
		keywords: '',
		available: true,

		loadDefinition: () =>
			import('../json/json-csharp-interface.tool').then((module) => module.definition),
	},
	{
		id: 'json-csv',
		category: 'json',
		name: text('JSON para CSV', 'JSON to CSV', undefined, 'tools.json-csv'),
		description: text(
			'Converta uma lista de objetos JSON em uma tabela CSV.',
			'Convert a JSON array of objects into a CSV table.',
			'Convierte una lista de objetos JSON en una tabla CSV.',
			'tools.json-csv',
		),
		icon: 'code',
		keywords: '',
		available: true,

		loadDefinition: () => import('../json/json-csv.tool').then((module) => module.definition),
	},
	{
		id: 'csv-json',
		category: 'json',
		name: text('CSV para JSON', 'CSV to JSON', undefined, 'tools.csv-json'),
		description: text(
			'Transforme CSV com cabeçalho em uma lista de objetos JSON.',
			'Turn CSV with headers into a JSON array of objects.',
			'Convierte CSV con encabezado en una lista de objetos JSON.',
			'tools.csv-json',
		),
		icon: 'code',
		keywords: '',
		available: true,

		loadDefinition: () => import('../json/csv-json.tool').then((module) => module.definition),
	},
	{
		id: 'json-to-yaml',
		category: 'json',
		name: text('JSON para YAML', 'JSON to YAML', undefined, 'tools.json-to-yaml'),
		description: text(
			'Converta um documento JSON para YAML.',
			'Convert a JSON document to YAML.',
			'Convierte un documento JSON a YAML.',
			'tools.json-to-yaml',
		),
		icon: 'code',
		keywords: '',
		available: true,

		loadDefinition: () => import('../json/json-to-yaml.tool').then((module) => module.definition),
	},
	{
		id: 'yaml-to-json',
		category: 'json',
		name: text('YAML para JSON', 'YAML to JSON', undefined, 'tools.yaml-to-json'),
		description: text(
			'Converta YAML para JSON e confira a estrutura.',
			'Convert YAML to JSON and inspect its structure.',
			'Convierte YAML a JSON y revisa su estructura.',
			'tools.yaml-to-json',
		),
		icon: 'code',
		keywords: '',
		available: true,

		loadDefinition: () => import('../json/yaml-to-json.tool').then((module) => module.definition),
	},
	{
		id: 'json-xml',
		category: 'json',
		name: text('JSON para XML', 'JSON to XML', undefined, 'tools.json-xml'),
		description: text(
			'Converta objetos JSON em XML com elemento raiz.',
			'Convert JSON objects to XML with a root element.',
			'Convierte objetos JSON a XML con un elemento raíz.',
			'tools.json-xml',
		),
		icon: 'code',
		keywords: '',
		available: true,

		loadDefinition: () => import('../json/json-xml.tool').then((module) => module.definition),
	},
	{
		id: 'json-sql',
		category: 'json',
		name: text('JSON para SQL INSERT', 'JSON to SQL INSERT', undefined, 'tools.json-sql'),
		description: text(
			'Gere comandos SQL INSERT a partir de objetos JSON.',
			'Generate SQL INSERT statements from JSON objects.',
			'Genera sentencias SQL INSERT a partir de objetos JSON.',
			'tools.json-sql',
		),
		icon: 'code',
		keywords: '',
		available: true,

		loadDefinition: () => import('../json/json-sql.tool').then((module) => module.definition),
	},
	{
		id: 'schema-faker',
		category: 'json',
		name: text('JSON Schema Faker', 'JSON Schema Faker', undefined, 'tools.schema-faker'),
		description: text(
			'Gere dados sintéticos que seguem um JSON Schema.',
			'Generate synthetic data matching a JSON Schema.',
			'Genera datos sintéticos que cumplen un JSON Schema.',
			'tools.schema-faker',
		),
		icon: 'code',
		keywords: '',
		available: true,

		loadDefinition: () => import('../json/schema-faker.tool').then((module) => module.definition),
	},
];
