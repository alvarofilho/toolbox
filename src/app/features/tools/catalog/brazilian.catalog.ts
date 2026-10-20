import type { ToolRegistration } from '@app/features/tools/catalog/tool-registration';

export const BRAZILIAN_TOOLS: readonly ToolRegistration[] = [
	{
		id: 'cpf',
		name: 'tools.cpf.cpf_generator_validator',
		description: 'tools.cpf.generate_test_cpfs_and_validate_check_digi',
		category: 'brazilian',
		icon: 'document',
		keywords: 'brasil documento pessoa fisica brazil',
		available: true,
		loadDefinition: () => import('../brazilian/cpf.tool').then((module) => module.definition),
	},
	{
		id: 'cnpj',
		name: 'tools.cnpj.cnpj_generator_validator',
		description: 'tools.cnpj.numeric_and_alphanumeric_cnpj_for_testing',
		category: 'brazilian',
		icon: 'building',
		keywords: 'brasil empresa juridica alfanumerico brazil',
		available: true,

		loadDefinition: () => import('../brazilian/cnpj.tool').then((module) => module.definition),
	},
	{
		id: 'person',
		name: 'tools.person.fake_person_generator',
		description: 'tools.person.synthetic_brazilian_data_in_json_csv_or_sq',
		category: 'brazilian',
		icon: 'users',
		keywords: 'fake faker pessoa massa seed brasileiro email telefone',
		available: true,

		loadDefinition: () => import('../brazilian/person.tool').then((module) => module.definition),
	},
	{
		id: 'pis',
		category: 'brazilian',
		name: 'tools.pis.pis_pasep_validator',
		description: 'tools.pis.check_a_pis_pasep_number_s_check_digits',
		icon: 'code',
		keywords: '',
		available: true,

		loadDefinition: () => import('../brazilian/pis.tool').then((module) => module.definition),
	},
	{
		id: 'cnh',
		category: 'brazilian',
		name: 'tools.cnh.cnh_validator',
		description: 'tools.cnh.check_a_cnh_number_s_check_digits',
		icon: 'code',
		keywords: '',
		available: true,

		loadDefinition: () => import('../brazilian/cnh.tool').then((module) => module.definition),
	},
	{
		id: 'pis-generator',
		category: 'brazilian',
		name: 'tools.pis-generator.pis_pasep_generator',
		description: 'tools.pis-generator.generate_synthetic_pis_pasep_numbers_for_t',
		icon: 'code',
		keywords: '',
		available: true,

		loadDefinition: () =>
			import('../brazilian/pis-generator.tool').then((module) => module.definition),
	},
	{
		id: 'cnh-generator',
		category: 'brazilian',
		name: 'tools.cnh-generator.cnh_generator',
		description: 'tools.cnh-generator.generate_synthetic_cnh_numbers_for_testing',
		icon: 'code',
		keywords: '',
		available: true,

		loadDefinition: () =>
			import('../brazilian/cnh-generator.tool').then((module) => module.definition),
	},
	{
		id: 'voter-generator',
		category: 'brazilian',
		name: 'tools.voter-generator.voter_registration_generator',
		description: 'tools.voter-generator.generate_synthetic_voter_registrations_for',
		icon: 'code',
		keywords: '',
		available: true,

		loadDefinition: () =>
			import('../brazilian/voter-generator.tool').then((module) => module.definition),
	},
	{
		id: 'rg-generator',
		category: 'brazilian',
		name: 'tools.rg-generator.synthetic_rg_generator',
		description: 'tools.rg-generator.create_fictional_rg_numbers_without_regist',
		icon: 'code',
		keywords: '',
		available: true,

		loadDefinition: () =>
			import('../brazilian/rg-generator.tool').then((module) => module.definition),
	},
	{
		id: 'ie-generator',
		category: 'brazilian',
		name: 'tools.ie-generator.state_registration_generator',
		description: 'tools.ie-generator.generate_synthetic_state_registrations_for',
		icon: 'code',
		keywords: '',
		available: true,

		loadDefinition: () =>
			import('../brazilian/ie-generator.tool').then((module) => module.definition),
	},
	{
		id: 'renavam',
		category: 'brazilian',
		name: 'tools.renavam.renavam_generator_and_validator',
		description: 'tools.renavam.generate_synthetic_renavam_numbers_or_chec',
		icon: 'code',
		keywords: '',
		available: true,

		loadDefinition: () => import('../brazilian/renavam.tool').then((module) => module.definition),
	},
	{
		id: 'plate',
		category: 'brazilian',
		name: 'tools.plate.vehicle_plate_generator_and_validator',
		description: 'tools.plate.generate_fictional_plates_or_check_a_plate',
		icon: 'code',
		keywords: '',
		available: true,

		loadDefinition: () => import('../brazilian/plate.tool').then((module) => module.definition),
	},
	{
		id: 'credit-card',
		category: 'brazilian',
		name: 'tools.credit-card.test_card_generator_and_validator',
		description: 'tools.credit-card.generate_test_card_numbers_or_check_their_',
		icon: 'code',
		keywords: '',
		available: true,

		loadDefinition: () =>
			import('../brazilian/credit-card.tool').then((module) => module.definition),
	},
	{
		id: 'bank-account',
		category: 'brazilian',
		name: 'tools.bank-account.test_bank_account_generator',
		description: 'tools.bank-account.create_fictional_bank_account_data_for_tes',
		icon: 'code',
		keywords: '',
		available: true,

		loadDefinition: () =>
			import('../brazilian/bank-account.tool').then((module) => module.definition),
	},
	{
		id: 'certificate-number',
		category: 'brazilian',
		name: 'tools.certificate-number.certificate_record_number_generator',
		description: 'tools.certificate-number.generate_synthetic_certificate_record_numb',
		icon: 'code',
		keywords: '',
		available: true,

		loadDefinition: () =>
			import('../brazilian/certificate-number.tool').then((module) => module.definition),
	},
	{
		id: 'ie',
		category: 'brazilian',
		name: 'tools.ie.state_registration_validator',
		description: 'tools.ie.check_a_state_registration_using_its_state',
		icon: 'code',
		keywords: '',
		available: true,

		loadDefinition: () => import('../brazilian/ie.tool').then((module) => module.definition),
	},
	{
		id: 'voter',
		category: 'brazilian',
		name: 'tools.voter.voter_registration_validator',
		description: 'tools.voter.check_a_voter_registration_number_s_check_',
		icon: 'code',
		keywords: '',
		available: true,

		loadDefinition: () => import('../brazilian/voter.tool').then((module) => module.definition),
	},
	{
		id: 'nfe',
		category: 'brazilian',
		name: 'tools.nfe.nfe_access_key_title',
		description: 'tools.nfe.generate_a_synthetic_nf_e_key_or_check_its',
		icon: 'code',
		keywords: '',
		available: true,

		loadDefinition: () => import('../brazilian/nfe.tool').then((module) => module.definition),
	},
	{
		id: 'pix',
		category: 'brazilian',
		name: 'tools.pix.pix_payload_generator_decoder',
		description: 'tools.pix.generate_or_decode_static_pix_payloads_wit',
		icon: 'code',
		keywords: '',
		available: true,

		loadDefinition: () => import('../brazilian/pix.tool').then((module) => module.definition),
	},
	{
		id: 'boleto',
		category: 'brazilian',
		name: 'tools.boleto.boleto_barcode_converter',
		description: 'tools.boleto.validate_and_convert_boleto_payment_lines_',
		icon: 'code',
		keywords: '',
		available: true,

		loadDefinition: () => import('../brazilian/boleto.tool').then((module) => module.definition),
	},
	{
		id: 'document-mask',
		category: 'brazilian',
		name: 'tools.document-mask.brazilian_document_masks',
		description: 'tools.document-mask.add_or_remove_formatting_from_brazilian_do',
		icon: 'code',
		keywords: '',
		available: true,

		loadDefinition: () =>
			import('../brazilian/document-mask.tool').then((module) => module.definition),
	},
];
