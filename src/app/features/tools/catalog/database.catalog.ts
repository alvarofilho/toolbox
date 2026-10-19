import { text } from '@app/core/models/tool';
import type { ToolRegistration } from '@app/features/tools/catalog/tool-registration';

export const DATABASE_TOOLS: readonly ToolRegistration[] = [
	{
		id: 'ddl-csharp',
		category: 'database',
		name: text('SQL DDL para classes C#', 'SQL DDL to C# Classes', undefined, 'tools.ddl-csharp'),
		description: text(
			'Transforme CREATE TABLE PostgreSQL em classes C#.',
			'Turn PostgreSQL CREATE TABLE into C# classes.',
			'Convierte CREATE TABLE PostgreSQL en clases C#.',
			'tools.ddl-csharp',
		),
		icon: 'code',
		keywords: '',
		available: true,

		loadDefinition: () => import('../database/ddl-csharp.tool').then((module) => module.definition),
	},
	{
		id: 'json-csharp',
		category: 'database',
		name: text('JSON para classes C#', 'JSON to C# Classes', undefined, 'tools.json-csharp'),
		description: text(
			'Gere classes C# a partir da estrutura de objetos JSON.',
			'Generate C# classes from JSON object structures.',
			'Genera clases C# a partir de estructuras de objetos JSON.',
			'tools.json-csharp',
		),
		icon: 'code',
		keywords: '',
		available: true,

		loadDefinition: () =>
			import('../database/json-csharp.tool').then((module) => module.definition),
	},
	{
		id: 'sql-insert',
		category: 'database',
		name: text('SQL INSERT Generator', 'SQL INSERT Generator', undefined, 'tools.sql-insert'),
		description: text(
			'Transforme registros JSON em comandos SQL INSERT.',
			'Turn JSON records into SQL INSERT statements.',
			'Convierte registros JSON en sentencias SQL INSERT.',
			'tools.sql-insert',
		),
		icon: 'code',
		keywords: '',
		available: true,

		loadDefinition: () => import('../database/sql-insert.tool').then((module) => module.definition),
	},
	{
		id: 'database-seed',
		category: 'database',
		name: text(
			'Database Seed Generator',
			'Database Seed Generator',
			undefined,
			'tools.database-seed',
		),
		description: text(
			'Gere registros sintéticos como comandos SQL INSERT.',
			'Generate synthetic records as SQL INSERT statements.',
			'Genera registros sintéticos como sentencias SQL INSERT.',
			'tools.database-seed',
		),
		icon: 'code',
		keywords: '',
		available: true,

		loadDefinition: () =>
			import('../database/database-seed.tool').then((module) => module.definition),
	},
	{
		id: 'connection-string',
		category: 'database',
		name: text(
			'Connection String Builder',
			'Connection String Builder',
			undefined,
			'tools.connection-string',
		),
		description: text(
			'Monte connection strings para SQL Server, PostgreSQL, MySQL ou SQLite.',
			'Build connection strings for SQL Server, PostgreSQL, MySQL or SQLite.',
			'Crea cadenas de conexión para SQL Server, PostgreSQL, MySQL o SQLite.',
			'tools.connection-string',
		),
		icon: 'code',
		keywords: '',
		available: true,

		loadDefinition: () =>
			import('../database/connection-string.tool').then((module) => module.definition),
	},
	{
		id: 'dotnet-ticks',
		category: 'database',
		name: text('.NET Ticks Converter', '.NET Ticks Converter', undefined, 'tools.dotnet-ticks'),
		description: text(
			'Converta datas ISO e ticks .NET com precisão de 100 ns.',
			'Convert ISO dates and .NET ticks with 100 ns precision.',
			'Convierte fechas ISO y ticks .NET con precisión de 100 ns.',
			'tools.dotnet-ticks',
		),
		icon: 'code',
		keywords: '',
		available: true,

		loadDefinition: () =>
			import('../database/dotnet-ticks.tool').then((module) => module.definition),
	},
	{
		id: 'guid-formatter',
		category: 'database',
		name: text('GUID Formatter', 'GUID Formatter', undefined, 'tools.guid-formatter'),
		description: text(
			'Reformate GUIDs entre os formatos D, N, B, P e X.',
			'Reformat GUIDs between D, N, B, P and X formats.',
			'Reformatea GUID entre los formatos D, N, B, P y X.',
			'tools.guid-formatter',
		),
		icon: 'code',
		keywords: '',
		available: true,

		loadDefinition: () =>
			import('../database/guid-formatter.tool').then((module) => module.definition),
	},
	{
		id: 'csharp-escape',
		category: 'database',
		name: text('C# String Escape', 'C# String Escape', undefined, 'tools.csharp-escape'),
		description: text(
			'Escape texto para strings C# regulares ou verbatim.',
			'Escape text for regular or verbatim C# strings.',
			'Escapa texto para cadenas C# regulares o verbatim.',
			'tools.csharp-escape',
		),
		icon: 'code',
		keywords: '',
		available: true,

		loadDefinition: () =>
			import('../database/csharp-escape.tool').then((module) => module.definition),
	},
	{
		id: 'pascal-camel',
		category: 'database',
		name: text(
			'PascalCase / camelCase Converter',
			'PascalCase / camelCase Converter',
			undefined,
			'tools.pascal-camel',
		),
		description: text(
			'Converta nomes entre PascalCase e camelCase.',
			'Convert names between PascalCase and camelCase.',
			'Convierte nombres entre PascalCase y camelCase.',
			'tools.pascal-camel',
		),
		icon: 'code',
		keywords: '',
		available: true,

		loadDefinition: () =>
			import('../database/pascal-camel.tool').then((module) => module.definition),
	},
	{
		id: 'sql-schema-diff',
		category: 'database',
		name: text('SQL Schema Diff', 'SQL Schema Diff', undefined, 'tools.sql-schema-diff'),
		description: text(
			'Compare estruturas CREATE TABLE PostgreSQL e veja as diferenças.',
			'Compare PostgreSQL CREATE TABLE structures and see differences.',
			'Compara estructuras CREATE TABLE PostgreSQL y consulta las diferencias.',
			'tools.sql-schema-diff',
		),
		icon: 'code',
		keywords: '',
		available: true,

		loadDefinition: () =>
			import('../database/sql-schema-diff.tool').then((module) => module.definition),
	},
];
