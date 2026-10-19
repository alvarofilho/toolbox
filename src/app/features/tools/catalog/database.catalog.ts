import { text } from '@app/core/models/tool';
import type { ToolRegistration } from '@app/features/tools/catalog/tool-registration';

export const DATABASE_TOOLS: readonly ToolRegistration[] = [
	{
		id: 'ddl-csharp',
		category: 'database',
		name: text('SQL DDL para classes C#', 'SQL DDL to C# Classes'),
		description: text(
			'SQL DDL para classes C#: processe e exporte localmente.',
			'SQL DDL to C# Classes: process and export locally.',
			'SQL DDL para classes C#: procesa y exporta localmente.',
		),
		icon: 'code',
		keywords: 'SQL DDL para classes C# SQL DDL to C# Classes',
		available: true,
		isNew: true,
		loadDefinition: () => import('../database/ddl-csharp.tool').then((module) => module.definition),
	},
	{
		id: 'json-csharp',
		category: 'database',
		name: text('JSON para classes C#', 'JSON to C# Classes'),
		description: text(
			'JSON para classes C#: processe e exporte localmente.',
			'JSON to C# Classes: process and export locally.',
			'JSON para classes C#: procesa y exporta localmente.',
		),
		icon: 'code',
		keywords: 'JSON para classes C# JSON to C# Classes',
		available: true,
		isNew: true,
		loadDefinition: () =>
			import('../database/json-csharp.tool').then((module) => module.definition),
	},
	{
		id: 'sql-insert',
		category: 'database',
		name: text('SQL INSERT Generator', 'SQL INSERT Generator'),
		description: text(
			'SQL INSERT Generator: processe e exporte localmente.',
			'SQL INSERT Generator: process and export locally.',
			'SQL INSERT Generator: procesa y exporta localmente.',
		),
		icon: 'code',
		keywords: 'SQL INSERT Generator SQL INSERT Generator',
		available: true,
		isNew: true,
		loadDefinition: () => import('../database/sql-insert.tool').then((module) => module.definition),
	},
	{
		id: 'database-seed',
		category: 'database',
		name: text('Database Seed Generator', 'Database Seed Generator'),
		description: text(
			'Database Seed Generator: processe e exporte localmente.',
			'Database Seed Generator: process and export locally.',
			'Database Seed Generator: procesa y exporta localmente.',
		),
		icon: 'code',
		keywords: 'Database Seed Generator Database Seed Generator',
		available: true,
		isNew: true,
		loadDefinition: () =>
			import('../database/database-seed.tool').then((module) => module.definition),
	},
	{
		id: 'connection-string',
		category: 'database',
		name: text('Connection String Builder', 'Connection String Builder'),
		description: text(
			'Connection String Builder: processe e exporte localmente.',
			'Connection String Builder: process and export locally.',
			'Connection String Builder: procesa y exporta localmente.',
		),
		icon: 'code',
		keywords: 'Connection String Builder Connection String Builder',
		available: true,
		isNew: true,
		loadDefinition: () =>
			import('../database/connection-string.tool').then((module) => module.definition),
	},
	{
		id: 'dotnet-ticks',
		category: 'database',
		name: text('.NET Ticks Converter', '.NET Ticks Converter'),
		description: text(
			'.NET Ticks Converter: processe e exporte localmente.',
			'.NET Ticks Converter: process and export locally.',
			'.NET Ticks Converter: procesa y exporta localmente.',
		),
		icon: 'code',
		keywords: '.NET Ticks Converter .NET Ticks Converter',
		available: true,
		isNew: true,
		loadDefinition: () =>
			import('../database/dotnet-ticks.tool').then((module) => module.definition),
	},
	{
		id: 'guid-formatter',
		category: 'database',
		name: text('GUID Formatter', 'GUID Formatter'),
		description: text(
			'GUID Formatter: processe e exporte localmente.',
			'GUID Formatter: process and export locally.',
			'GUID Formatter: procesa y exporta localmente.',
		),
		icon: 'code',
		keywords: 'GUID Formatter GUID Formatter',
		available: true,
		isNew: true,
		loadDefinition: () =>
			import('../database/guid-formatter.tool').then((module) => module.definition),
	},
	{
		id: 'csharp-escape',
		category: 'database',
		name: text('C# String Escape', 'C# String Escape'),
		description: text(
			'C# String Escape: processe e exporte localmente.',
			'C# String Escape: process and export locally.',
			'C# String Escape: procesa y exporta localmente.',
		),
		icon: 'code',
		keywords: 'C# String Escape C# String Escape',
		available: true,
		isNew: true,
		loadDefinition: () =>
			import('../database/csharp-escape.tool').then((module) => module.definition),
	},
	{
		id: 'pascal-camel',
		category: 'database',
		name: text('PascalCase / camelCase Converter', 'PascalCase / camelCase Converter'),
		description: text(
			'PascalCase / camelCase Converter: processe e exporte localmente.',
			'PascalCase / camelCase Converter: process and export locally.',
			'PascalCase / camelCase Converter: procesa y exporta localmente.',
		),
		icon: 'code',
		keywords: 'PascalCase / camelCase Converter PascalCase / camelCase Converter',
		available: true,
		isNew: true,
		loadDefinition: () =>
			import('../database/pascal-camel.tool').then((module) => module.definition),
	},
	{
		id: 'sql-schema-diff',
		category: 'database',
		name: text('SQL Schema Diff', 'SQL Schema Diff'),
		description: text(
			'SQL Schema Diff: processe e exporte localmente.',
			'SQL Schema Diff: process and export locally.',
			'SQL Schema Diff: procesa y exporta localmente.',
		),
		icon: 'code',
		keywords: 'SQL Schema Diff SQL Schema Diff',
		available: true,
		isNew: true,
		loadDefinition: () =>
			import('../database/sql-schema-diff.tool').then((module) => module.definition),
	},
];
