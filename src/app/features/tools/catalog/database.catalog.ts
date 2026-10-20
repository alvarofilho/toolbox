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
		id: 'json-csharp',
		category: 'database',
		name: 'tools.json-csharp.json_to_c_classes',
		description: 'tools.json-csharp.generate_c_classes_from_json_object_struct',
		icon: 'code',
		keywords: '',
		available: true,

		loadDefinition: () =>
			import('../database/json-csharp.tool').then((module) => module.definition),
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
		id: 'dotnet-ticks',
		category: 'database',
		name: 'tools.dotnet-ticks.net_ticks_converter',
		description: 'tools.dotnet-ticks.convert_iso_dates_and_net_ticks_with_100_n',
		icon: 'code',
		keywords: '',
		available: true,

		loadDefinition: () =>
			import('../database/dotnet-ticks.tool').then((module) => module.definition),
	},
	{
		id: 'guid-formatter',
		category: 'database',
		name: 'tools.guid-formatter.guid_formatter',
		description: 'tools.guid-formatter.reformat_guids_between_d_n_b_p_and_x_forma',
		icon: 'code',
		keywords: '',
		available: true,

		loadDefinition: () =>
			import('../database/guid-formatter.tool').then((module) => module.definition),
	},
	{
		id: 'csharp-escape',
		category: 'database',
		name: 'tools.csharp-escape.c_string_escape',
		description: 'tools.csharp-escape.escape_text_for_regular_or_verbatim_c_stri',
		icon: 'code',
		keywords: '',
		available: true,

		loadDefinition: () =>
			import('../database/csharp-escape.tool').then((module) => module.definition),
	},
	{
		id: 'pascal-camel',
		category: 'database',
		name: 'tools.pascal-camel.pascalcase_camelcase_converter',
		description: 'tools.pascal-camel.convert_names_between_pascalcase_and_camel',
		icon: 'code',
		keywords: '',
		available: true,

		loadDefinition: () =>
			import('../database/pascal-camel.tool').then((module) => module.definition),
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
