import type { ToolRegistration } from '@app/features/tools/catalog/tool-registration';

export const GENERATORS_TOOLS: readonly ToolRegistration[] = [
	{
		id: 'uuid',
		name: 'tools.uuid.uuid_generator',
		description: 'tools.uuid.create_unique_version_4_and_7_identifiers',
		category: 'generators',
		icon: 'fingerprint',
		keywords: 'guid uuidv4 uuidv7 id random',
		available: true,
		popular: true,
		loadDefinition: () => import('../generators/uuid.tool').then((module) => module.definition),
	},
	{
		id: 'password',
		name: 'tools.password.password_generator',
		description: 'tools.password.generate_strong_passwords_with_your_rules',
		category: 'generators',
		icon: 'key',
		keywords: 'senha password segura aleatorio secure',
		available: true,
		popular: true,
		loadDefinition: () => import('../generators/password.tool').then((module) => module.definition),
	},
	{
		id: 'token',
		name: 'tools.token.secure_token_and_key_generator',
		description: 'tools.token.generate_tokens_secrets_and_keys_with_cryp',
		category: 'generators',
		icon: 'hash',
		keywords: 'secret token key chave criptografica hexadecimal hex base64 random seguro',
		available: true,
		loadDefinition: () => import('../generators/token.tool').then((module) => module.definition),
	},
	{
		id: 'company',
		category: 'generators',
		name: 'tools.company.company_generator',
		description: 'tools.company.generate_fictional_companies_with_cnpj_as_',
		icon: 'spark',
		keywords: '',
		available: true,

		loadDefinition: () => import('../generators/company.tool').then((module) => module.definition),
	},
	{
		id: 'address',
		category: 'generators',
		name: 'tools.address.address_generator',
		description: 'tools.address.generate_synthetic_addresses_by_state_as_j',
		icon: 'spark',
		keywords: '',
		available: true,

		loadDefinition: () => import('../generators/address.tool').then((module) => module.definition),
	},
	{
		id: 'email',
		category: 'generators',
		name: 'tools.email.email_generator',
		description: 'tools.email.create_test_email_addresses_using_example_',
		icon: 'spark',
		keywords: '',
		available: true,

		loadDefinition: () => import('../generators/email.tool').then((module) => module.definition),
	},
	{
		id: 'phone',
		category: 'generators',
		name: 'tools.phone.phone_generator',
		description: 'tools.phone.generate_fictional_phone_numbers_with_your',
		icon: 'spark',
		keywords: '',
		available: true,

		loadDefinition: () => import('../generators/phone.tool').then((module) => module.definition),
	},
	{
		id: 'ulid',
		category: 'generators',
		name: 'tools.ulid.ulid_generator',
		description: 'tools.ulid.create_time_sortable_ulid_identifiers',
		icon: 'spark',
		keywords: '',
		available: true,

		loadDefinition: () => import('../generators/ulid.tool').then((module) => module.definition),
	},
	{
		id: 'guid',
		category: 'generators',
		name: 'tools.guid.guid_generator',
		description: 'tools.guid.generate_a_list_of_random_guid_identifiers',
		icon: 'spark',
		keywords: '',
		available: true,

		loadDefinition: () => import('../generators/guid.tool').then((module) => module.definition),
	},
	{
		id: 'random-date',
		category: 'generators',
		name: 'tools.random-date.random_date_generator',
		description: 'tools.random-date.generate_random_dates_within_an_iso_date_r',
		icon: 'spark',
		keywords: '',
		available: true,

		loadDefinition: () =>
			import('../generators/random-date.tool').then((module) => module.definition),
	},
	{
		id: 'lorem',
		category: 'generators',
		name: 'tools.lorem.lorem_ipsum_generator',
		description: 'tools.lorem.generate_placeholder_paragraphs_for_protot',
		icon: 'spark',
		keywords: '',
		available: true,

		loadDefinition: () => import('../generators/lorem.tool').then((module) => module.definition),
	},
	{
		id: 'qr',
		category: 'generators',
		name: 'tools.qr.qr_code_generator',
		description: 'tools.qr.turn_text_or_a_url_into_an_svg_qr_code',
		icon: 'spark',
		keywords: '',
		available: true,

		loadDefinition: () => import('../generators/qr.tool').then((module) => module.definition),
	},
	{
		id: 'data-generator',
		category: 'generators',
		name: 'tools.data-generator.test_data_generator',
		description: 'tools.data-generator.define_fields_and_types_to_generate_json_c',
		icon: 'spark',
		keywords: '',
		available: true,

		loadDefinition: () =>
			import('../generators/data-generator.tool').then((module) => module.definition),
	},
];
