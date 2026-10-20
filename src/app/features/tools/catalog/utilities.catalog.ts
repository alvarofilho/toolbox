import type { ToolRegistration } from '@app/features/tools/catalog/tool-registration';

export const UTILITIES_TOOLS: readonly ToolRegistration[] = [
	{
		id: 'basic-auth',
		category: 'utilities',
		name: 'tools.basic-auth.basic_auth_generator',
		description: 'tools.basic-auth.generate_a_basic_auth_header_from_a_userna',
		icon: 'code',
		keywords: '',
		available: true,

		loadDefinition: () =>
			import('../utilities/basic-auth.tool').then((module) => module.definition),
	},
	{
		id: 'password-strength',
		category: 'utilities',
		name: 'tools.password-strength.password_strength_analyzer',
		description: 'tools.password-strength.estimate_a_test_password_s_strength_with_l',
		icon: 'code',
		keywords: '',
		available: true,

		loadDefinition: () =>
			import('../utilities/password-strength.tool').then((module) => module.definition),
	},
	{
		id: 'otp',
		category: 'utilities',
		name: 'tools.otp.otp_generator_and_validator',
		description: 'tools.otp.generate_or_verify_totp_codes_with_a_base3',
		icon: 'code',
		keywords: '',
		available: true,

		loadDefinition: () => import('../utilities/otp.tool').then((module) => module.definition),
	},
	{
		id: 'user-agent',
		category: 'utilities',
		name: 'tools.user-agent.user_agent_parser',
		description: 'tools.user-agent.identify_browser_and_platform_in_a_user_ag',
		icon: 'code',
		keywords: '',
		available: true,

		loadDefinition: () =>
			import('../utilities/user-agent.tool').then((module) => module.definition),
	},
	{
		id: 'meta-tags',
		category: 'utilities',
		name: 'tools.meta-tags.meta_tags_generator',
		description: 'tools.meta-tags.generate_title_description_and_sharing_tag',
		icon: 'code',
		keywords: '',
		available: true,

		loadDefinition: () => import('../utilities/meta-tags.tool').then((module) => module.definition),
	},
	{
		id: 'mime-types',
		category: 'utilities',
		name: 'tools.mime-types.mime_type_lookup',
		description: 'tools.mime-types.look_up_mime_types_by_extension_or_format_',
		icon: 'code',
		keywords: '',
		available: true,

		loadDefinition: () =>
			import('../utilities/mime-types.tool').then((module) => module.definition),
	},
	{
		id: 'nato',
		category: 'utilities',
		name: 'tools.nato.nato_phonetic_alphabet',
		description: 'tools.nato.spell_out_text_with_the_nato_phonetic_alph',
		icon: 'code',
		keywords: '',
		available: true,

		loadDefinition: () => import('../utilities/nato.tool').then((module) => module.definition),
	},
	{
		id: 'percentage',
		category: 'utilities',
		name: 'tools.percentage.percentage_calculator',
		description: 'tools.percentage.calculate_percentages_ratios_and_percentag',
		icon: 'code',
		keywords: '',
		available: true,

		loadDefinition: () =>
			import('../utilities/percentage.tool').then((module) => module.definition),
	},
	{
		id: 'random-number',
		category: 'utilities',
		name: 'tools.random-number.random_number_generator',
		description: 'tools.random-number.generate_integers_within_your_chosen_limit',
		icon: 'code',
		keywords: '',
		available: true,

		loadDefinition: () =>
			import('../utilities/random-number.tool').then((module) => module.definition),
	},
	{
		id: 'rsa-keypair',
		category: 'utilities',
		name: 'tools.rsa-keypair.rsa_key_pair_generator',
		description: 'tools.rsa-keypair.generate_an_rsa_public_and_private_key_pai',
		icon: 'code',
		keywords: '',
		available: true,

		loadDefinition: () =>
			import('../utilities/rsa-keypair.tool').then((module) => module.definition),
	},
	{
		id: 'math-evaluator',
		category: 'utilities',
		name: 'tools.math-evaluator.math_expression_evaluator',
		description: 'tools.math-evaluator.evaluate_expressions_with_numbers_operator',
		icon: 'code',
		keywords: '',
		available: true,

		loadDefinition: () =>
			import('../utilities/math-evaluator.tool').then((module) => module.definition),
	},
	{
		id: 'rule-of-three',
		category: 'utilities',
		name: 'tools.rule-of-three.rule_of_three_calculator',
		description: 'tools.rule-of-three.find_the_fourth_value_in_a_direct_proporti',
		icon: 'code',
		keywords: '',
		available: true,

		loadDefinition: () =>
			import('../utilities/rule-of-three.tool').then((module) => module.definition),
	},
	{
		id: 'temperature',
		category: 'utilities',
		name: 'tools.temperature.temperature_converter',
		description: 'tools.temperature.convert_temperatures_between_celsius_fahre',
		icon: 'code',
		keywords: '',
		available: true,

		loadDefinition: () =>
			import('../utilities/temperature.tool').then((module) => module.definition),
	},
	{
		id: 'dotnet-appsettings',
		category: 'utilities',
		name: 'tools.dotnet-appsettings.net_appsettings_generator',
		description: 'tools.dotnet-appsettings.build_a_connection_string_in_a_net_appsett',
		icon: 'code',
		keywords: '',
		available: true,

		loadDefinition: () =>
			import('../utilities/dotnet-appsettings.tool').then((module) => module.definition),
	},
	{
		id: 'api-proxy',
		category: 'utilities',
		name: 'tools.api-proxy.api_proxy_config_generator',
		description: 'tools.api-proxy.generate_proxy_configuration_to_host_in_vi',
		icon: 'code',
		keywords: '',
		available: true,

		loadDefinition: () => import('../utilities/api-proxy.tool').then((module) => module.definition),
	},
	{
		id: 'bcrypt',
		category: 'utilities',
		name: 'tools.bcrypt.bcrypt_hash_and_verify',
		description: 'tools.bcrypt.generate_bcrypt_hashes_or_check_a_password',
		icon: 'code',
		keywords: '',
		available: true,

		loadDefinition: () => import('../utilities/bcrypt.tool').then((module) => module.definition),
	},
	{
		id: 'bip39',
		category: 'utilities',
		name: 'tools.bip39.bip39_mnemonic_generator_and_validator',
		description: 'tools.bip39.generate_or_validate_english_or_spanish_bi',
		icon: 'code',
		keywords: '',
		available: true,

		loadDefinition: () => import('../utilities/bip39.tool').then((module) => module.definition),
	},
	{
		id: 'toml-converter',
		category: 'utilities',
		name: 'tools.toml-converter.json_yaml_and_toml_converter',
		description: 'tools.toml-converter.convert_documents_between_json_yaml_and_to',
		icon: 'code',
		keywords: '',
		available: true,

		loadDefinition: () =>
			import('../utilities/toml-converter.tool').then((module) => module.definition),
	},
	{
		id: 'html-editor',
		category: 'utilities',
		name: 'tools.html-editor.safe_html_preview',
		description: 'tools.html-editor.preview_sanitized_html_in_an_isolated_envi',
		icon: 'code',
		keywords: '',
		available: true,

		loadDefinition: () =>
			import('../utilities/html-editor.tool').then((module) => module.definition),
	},
	{
		id: 'device-info',
		category: 'utilities',
		name: 'tools.device-info.device_information',
		description: 'tools.device-info.inspect_current_browser_and_device_informa',
		icon: 'code',
		keywords: '',
		available: true,

		loadDefinition: () =>
			import('../utilities/device-info.tool').then((module) => module.definition),
	},
	{
		id: 'keycode',
		category: 'utilities',
		name: 'tools.keycode.keyboard_key_identifier',
		description: 'tools.keycode.inspect_the_key_and_code_values_of_a_keybo',
		icon: 'code',
		keywords: '',
		available: true,

		loadDefinition: () => import('../utilities/keycode.tool').then((module) => module.definition),
	},
	{
		id: 'safe-link',
		category: 'utilities',
		name: 'tools.safe-link.safe_link_decoder',
		description: 'tools.safe-link.extract_the_original_url_from_a_supported_',
		icon: 'code',
		keywords: '',
		available: true,

		loadDefinition: () => import('../utilities/safe-link.tool').then((module) => module.definition),
	},
];
