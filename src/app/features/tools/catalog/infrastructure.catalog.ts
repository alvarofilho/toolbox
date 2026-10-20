import type { ToolRegistration } from '@app/features/tools/catalog/tool-registration';

export const INFRASTRUCTURE_TOOLS: readonly ToolRegistration[] = [
	{
		id: 'dns-lookup',
		category: 'infrastructure',
		name: 'tools.dns-lookup.dns_lookup',
		description: 'tools.dns-lookup.query_dns_records_and_compare_public_resolvers',
		icon: 'code',
		keywords: 'dns domain lookup resolver records mx txt spf dmarc dkim',
		available: true,
		loadDefinition: () =>
			import('../infrastructure/dns-lookup.tool').then((module) => module.definition),
	},
	{
		id: 'ipv4',
		category: 'infrastructure',
		name: 'tools.ipv4.ipv4_subnet_calculator',
		description: 'tools.ipv4.calculate_ipv4_network_mask_and_address_ra',
		icon: 'code',
		keywords: '',
		available: true,

		loadDefinition: () => import('../infrastructure/ipv4.tool').then((module) => module.definition),
	},
	{
		id: 'cidr',
		category: 'infrastructure',
		name: 'tools.cidr.cidr_calculator',
		description: 'tools.cidr.inspect_the_network_boundaries_of_an_ipv4_',
		icon: 'code',
		keywords: '',
		available: true,

		loadDefinition: () => import('../infrastructure/cidr.tool').then((module) => module.definition),
	},
	{
		id: 'ipv6',
		category: 'infrastructure',
		name: 'tools.ipv6.ipv6_calculator',
		description: 'tools.ipv6.expand_ipv6_addresses_and_calculate_their_',
		icon: 'code',
		keywords: '',
		available: true,

		loadDefinition: () => import('../infrastructure/ipv6.tool').then((module) => module.definition),
	},
	{
		id: 'chmod',
		category: 'infrastructure',
		name: 'tools.chmod.chmod_calculator',
		description: 'tools.chmod.convert_octal_permissions_to_symbolic_nota',
		icon: 'code',
		keywords: '',
		available: true,

		loadDefinition: () =>
			import('../infrastructure/chmod.tool').then((module) => module.definition),
	},
	{
		id: 'docker-compose',
		category: 'infrastructure',
		name: 'tools.docker-compose.docker_run_to_docker_compose',
		description: 'tools.docker-compose.turn_a_posix_docker_run_command_into_docke',
		icon: 'code',
		keywords: '',
		available: true,

		loadDefinition: () =>
			import('../infrastructure/docker-compose.tool').then((module) => module.definition),
	},
	{
		id: 'compose-viewer',
		category: 'infrastructure',
		name: 'tools.compose-viewer.docker_compose_visualizer',
		description: 'tools.compose-viewer.inspect_services_ports_and_dependencies_in',
		icon: 'code',
		keywords: '',
		available: true,

		loadDefinition: () =>
			import('../infrastructure/compose-viewer.tool').then((module) => module.definition),
	},
	{
		id: 'env-diff',
		category: 'infrastructure',
		name: 'tools.env-diff.env_diff',
		description: 'tools.env-diff.compare_variables_in_two_env_files',
		icon: 'code',
		keywords: '',
		available: true,

		loadDefinition: () =>
			import('../infrastructure/env-diff.tool').then((module) => module.definition),
	},
	{
		id: 'env-validator',
		category: 'infrastructure',
		name: 'tools.env-validator.env_validator',
		description: 'tools.env-validator.check_syntax_and_variable_references_in_en',
		icon: 'code',
		keywords: '',
		available: true,

		loadDefinition: () =>
			import('../infrastructure/env-validator.tool').then((module) => module.definition),
	},
	{
		id: 'gitignore',
		category: 'infrastructure',
		name: 'tools.gitignore.gitignore_generator',
		description: 'tools.gitignore.combine_local_templates_to_generate_a_giti',
		icon: 'code',
		keywords: '',
		available: true,

		loadDefinition: () =>
			import('../infrastructure/gitignore.tool').then((module) => module.definition),
	},
	{
		id: 'kubernetes',
		category: 'infrastructure',
		name: 'tools.kubernetes.kubernetes_yaml_validator',
		description: 'tools.kubernetes.validate_yaml_manifests_with_local_or_cust',
		icon: 'code',
		keywords: '',
		available: true,

		loadDefinition: () =>
			import('../infrastructure/kubernetes.tool').then((module) => module.definition),
	},
	{
		id: 'log-parser',
		category: 'infrastructure',
		name: 'tools.log-parser.log_parser',
		description: 'tools.log-parser.read_json_lines_or_apache_nginx_combined_l',
		icon: 'code',
		keywords: '',
		available: true,

		loadDefinition: () =>
			import('../infrastructure/log-parser.tool').then((module) => module.definition),
	},
];
