import type { ToolRegistration } from '@app/features/tools/catalog/tool-registration';

export const DATABASE_TOOLS: readonly ToolRegistration[] = [
	{
		id: 'ddl-csharp',
		category: 'database',
		name: 'tools.ddl-csharp.sql_ddl_to_c_classes',
		description: 'tools.ddl-csharp.turn_postgresql_create_table_into_c_classe',
		icon: 'code',
		keywords: '',
		available: true,

		loadDefinition: () => import('../database/ddl-csharp.tool').then((module) => module.definition),
	},
	{
		id: 'sql-insert',
		category: 'database',
		name: 'tools.sql-insert.sql_insert_generator',
		description: 'tools.sql-insert.turn_json_records_into_sql_insert_statemen',
		icon: 'code',
		keywords: '',
		available: true,

		loadDefinition: () => import('../database/sql-insert.tool').then((module) => module.definition),
	},
	{
		id: 'database-seed',
		category: 'database',
		name: 'tools.database-seed.database_seed_generator',
		description: 'tools.database-seed.generate_synthetic_records_as_sql_insert_s',
		icon: 'code',
		keywords: '',
		available: true,

		loadDefinition: () =>
			import('../database/database-seed.tool').then((module) => module.definition),
	},
	{
		id: 'connection-string',
		category: 'database',
		name: 'tools.connection-string.connection_string_builder',
		description: 'tools.connection-string.build_connection_strings_for_sql_server_po',
		icon: 'code',
		keywords: '',
		available: true,

		loadDefinition: () =>
			import('../database/connection-string.tool').then((module) => module.definition),
	},
	{
		id: 'sql-schema-diff',
		category: 'database',
		name: 'tools.sql-schema-diff.sql_schema_diff',
		description: 'tools.sql-schema-diff.compare_postgresql_create_table_structures',
		icon: 'code',
		keywords: '',
		available: true,

		loadDefinition: () =>
			import('../database/sql-schema-diff.tool').then((module) => module.definition),
	},
];
