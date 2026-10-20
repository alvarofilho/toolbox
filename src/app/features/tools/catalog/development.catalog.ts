import type { ToolRegistration } from '@app/features/tools/catalog/tool-registration';

export const DEVELOPMENT_TOOLS: readonly ToolRegistration[] = [
	{
		id: 'regex',
		name: 'tools.regex.regex_tester',
		description: 'tools.regex.test_regular_expressions_and_explore_match',
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
		name: 'tools.sql-formatter.sql_formatter',
		description: 'tools.sql-formatter.format_sql_with_indentation_in_your_chosen',
		icon: 'code',
		keywords: '',
		available: true,

		loadDefinition: () =>
			import('../development/sql-formatter.tool').then((module) => module.definition),
	},
	{
		id: 'xml-formatter',
		category: 'development',
		name: 'tools.xml-formatter.xml_formatter',
		description: 'tools.xml-formatter.format_xml_with_indentation_and_check_well',
		icon: 'code',
		keywords: '',
		available: true,

		loadDefinition: () =>
			import('../development/xml-formatter.tool').then((module) => module.definition),
	},
	{
		id: 'xml-validator',
		category: 'development',
		name: 'tools.xml-validator.xml_validator',
		description: 'tools.xml-validator.check_xml_well_formedness_without_xsd_vali',
		icon: 'code',
		keywords: '',
		available: true,

		loadDefinition: () =>
			import('../development/xml-validator.tool').then((module) => module.definition),
	},
	{
		id: 'yaml-formatter',
		category: 'development',
		name: 'tools.yaml-formatter.yaml_formatter',
		description: 'tools.yaml-formatter.format_the_indentation_of_a_yaml_document',
		icon: 'code',
		keywords: '',
		available: true,

		loadDefinition: () =>
			import('../development/yaml-formatter.tool').then((module) => module.definition),
	},
	{
		id: 'cron-builder',
		category: 'development',
		name: 'tools.cron-builder.cron_expression_builder',
		description: 'tools.cron-builder.build_a_cron_expression_and_see_its_next_o',
		icon: 'code',
		keywords: '',
		available: true,

		loadDefinition: () =>
			import('../development/cron-builder.tool').then((module) => module.definition),
	},
	{
		id: 'cron-parser',
		category: 'development',
		name: 'tools.cron-parser.cron_expression_parser',
		description: 'tools.cron-parser.interpret_a_cron_expression_in_your_chosen',
		icon: 'code',
		keywords: '',
		available: true,

		loadDefinition: () =>
			import('../development/cron-parser.tool').then((module) => module.definition),
	},
	{
		id: 'http-status',
		category: 'development',
		name: 'tools.http-status.http_status_explorer',
		description: 'tools.http-status.look_up_http_status_names_and_meanings',
		icon: 'code',
		keywords: '',
		available: true,

		loadDefinition: () =>
			import('../development/http-status.tool').then((module) => module.definition),
	},
	{
		id: 'http-headers',
		category: 'development',
		name: 'tools.http-headers.http_header_analyzer',
		description: 'tools.http-headers.inspect_http_headers_pasted_from_a_respons',
		icon: 'code',
		keywords: '',
		available: true,

		loadDefinition: () =>
			import('../development/http-headers.tool').then((module) => module.definition),
	},
	{
		id: 'url-parser',
		category: 'development',
		name: 'tools.url-parser.url_parser',
		description: 'tools.url-parser.split_a_url_into_protocol_host_path_and_pa',
		icon: 'code',
		keywords: '',
		available: true,

		loadDefinition: () =>
			import('../development/url-parser.tool').then((module) => module.definition),
	},
	{
		id: 'curl',
		category: 'development',
		name: 'tools.curl.curl_generator',
		description: 'tools.curl.generate_a_curl_command_with_method_header',
		icon: 'code',
		keywords: '',
		available: true,

		loadDefinition: () => import('../development/curl.tool').then((module) => module.definition),
	},
	{
		id: 'json-patch',
		category: 'development',
		name: 'tools.json-patch.json_patch_builder',
		description: 'tools.json-patch.compare_two_json_documents_and_generate_js',
		icon: 'code',
		keywords: '',
		available: true,

		loadDefinition: () =>
			import('../development/json-patch.tool').then((module) => module.definition),
	},
	{
		id: 'openapi',
		category: 'development',
		name: 'tools.openapi.openapi_viewer',
		description: 'tools.openapi.explore_operations_and_paths_in_openapi_or',
		icon: 'code',
		keywords: '',
		available: true,

		loadDefinition: () => import('../development/openapi.tool').then((module) => module.definition),
	},
	{
		id: 'openapi-diff',
		category: 'development',
		name: 'tools.openapi-diff.openapi_diff',
		description: 'tools.openapi-diff.find_changes_between_two_versions_of_an_op',
		icon: 'code',
		keywords: '',
		available: true,

		loadDefinition: () =>
			import('../development/openapi-diff.tool').then((module) => module.definition),
	},
	{
		id: 'graphql',
		category: 'development',
		name: 'tools.graphql.graphql_formatter',
		description: 'tools.graphql.format_graphql_queries_and_documents',
		icon: 'code',
		keywords: '',
		available: true,

		loadDefinition: () => import('../development/graphql.tool').then((module) => module.definition),
	},
	{
		id: 'semver',
		category: 'development',
		name: 'tools.semver.semantic_version_comparator',
		description: 'tools.semver.compare_semantic_versions_and_check_versio',
		icon: 'code',
		keywords: '',
		available: true,

		loadDefinition: () => import('../development/semver.tool').then((module) => module.definition),
	},
];
