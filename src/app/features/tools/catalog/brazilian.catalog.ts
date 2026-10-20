import type { ToolRegistration } from '@app/features/tools/catalog/tool-registration';

export const BRAZILIAN_TOOLS: readonly ToolRegistration[] = [
	{
		id: 'cpf',
		name: 'tools.cpf.cpf_generator_validator',
		description: 'tools.cpf.generate_test_cpfs_and_validate_check_digi',
		category: 'country-data',
		icon: 'document',
		keywords:
			'brasil documento pessoa fisica brazil documento de identidad identificacion fiscal personal',
		available: true,
		loadDefinition: () => import('../brazilian/cpf.tool').then((module) => module.definition),
	},
	{
		id: 'cnpj',
		name: 'tools.cnpj.cnpj_generator_validator',
		description: 'tools.cnpj.numeric_and_alphanumeric_cnpj_for_testing',
		category: 'country-data',
		icon: 'building',
		keywords:
			'brasil empresa juridica alfanumerico brazil empresa identificacion fiscal persona juridica',
		available: true,

		loadDefinition: () => import('../brazilian/cnpj.tool').then((module) => module.definition),
	},
	{
		id: 'person',
		name: 'tools.person.fake_person_generator',
		description: 'tools.person.synthetic_brazilian_data_in_json_csv_or_sq',
		category: 'country-data',
		icon: 'users',
		keywords:
			'fake faker pessoa massa seed brasileiro email telefone persona personas datos de prueba ficticios',
		available: true,

		loadDefinition: () => import('../brazilian/person.tool').then((module) => module.definition),
	},
	{
		id: 'pis',
		category: 'country-data',
		name: 'tools.pis.pis_pasep_validator',
		description: 'tools.pis.check_a_pis_pasep_number_s_check_digits',
		icon: 'document',
		keywords:
			'pis pasep previdência social social security identifier seguridad social prevision social',
		available: true,

		loadDefinition: () => import('../brazilian/pis.tool').then((module) => module.definition),
	},
	{
		id: 'cnh',
		category: 'country-data',
		name: 'tools.cnh.cnh_validator',
		description: 'tools.cnh.check_a_cnh_number_s_check_digits',
		icon: 'document',
		keywords:
			'cnh habilitação motorista carteira de motorista driver license driving licence licencia conducir permiso conducir',
		available: true,

		loadDefinition: () => import('../brazilian/cnh.tool').then((module) => module.definition),
	},
	{
		id: 'pis-generator',
		category: 'country-data',
		name: 'tools.pis-generator.pis_pasep_generator',
		description: 'tools.pis-generator.generate_synthetic_pis_pasep_numbers_for_t',
		icon: 'document',
		keywords: 'pis pasep gerar massa de teste synthetic test data generar datos de prueba',
		available: true,

		loadDefinition: () =>
			import('../brazilian/pis-generator.tool').then((module) => module.definition),
	},
	{
		id: 'cnh-generator',
		category: 'country-data',
		name: 'tools.cnh-generator.cnh_generator',
		description: 'tools.cnh-generator.generate_synthetic_cnh_numbers_for_testing',
		icon: 'document',
		keywords:
			'cnh habilitação motorista gerar sintético synthetic test data generar datos de prueba',
		available: true,

		loadDefinition: () =>
			import('../brazilian/cnh-generator.tool').then((module) => module.definition),
	},
	{
		id: 'voter-generator',
		category: 'country-data',
		name: 'tools.voter-generator.voter_registration_generator',
		description: 'tools.voter-generator.generate_synthetic_voter_registrations_for',
		icon: 'document',
		keywords:
			'título eleitoral zona seção eleitor voter registration test data registro electoral prueba',
		available: true,

		loadDefinition: () =>
			import('../brazilian/voter-generator.tool').then((module) => module.definition),
	},
	{
		id: 'rg-generator',
		category: 'country-data',
		name: 'tools.rg-generator.synthetic_rg_generator',
		description: 'tools.rg-generator.create_fictional_rg_numbers_without_regist',
		icon: 'document',
		keywords:
			'rg identidade documento de identidade identity card synthetic test data documento identidad datos de prueba',
		available: true,

		loadDefinition: () =>
			import('../brazilian/rg-generator.tool').then((module) => module.definition),
	},
	{
		id: 'ie-generator',
		category: 'country-data',
		name: 'tools.ie-generator.state_registration_generator',
		description: 'tools.ie-generator.generate_synthetic_state_registrations_for',
		icon: 'building',
		keywords: 'inscrição estadual ie estado tax registration test data registro estatal impuestos',
		available: true,

		loadDefinition: () =>
			import('../brazilian/ie-generator.tool').then((module) => module.definition),
	},
	{
		id: 'renavam',
		category: 'country-data',
		name: 'tools.renavam.renavam_generator_and_validator',
		description: 'tools.renavam.generate_synthetic_renavam_numbers_or_chec',
		icon: 'link',
		keywords: 'renavam veículo automóvel registro vehicle registration registro vehiculo matricula',
		available: true,

		loadDefinition: () => import('../brazilian/renavam.tool').then((module) => module.definition),
	},
	{
		id: 'plate',
		category: 'country-data',
		name: 'tools.plate.vehicle_plate_generator_and_validator',
		description: 'tools.plate.generate_fictional_plates_or_check_a_plate',
		icon: 'link',
		keywords: 'placa carro automóvel mercosul vehicle license plate matrícula patente vehiculo',
		available: true,

		loadDefinition: () => import('../brazilian/plate.tool').then((module) => module.definition),
	},
	{
		id: 'credit-card',
		category: 'country-data',
		name: 'tools.credit-card.test_card_generator_and_validator',
		description: 'tools.credit-card.generate_test_card_numbers_or_check_their_',
		icon: 'building',
		keywords: 'cartão de crédito luhn card payment test data tarjeta credito pago prueba',
		available: true,

		loadDefinition: () =>
			import('../brazilian/credit-card.tool').then((module) => module.definition),
	},
	{
		id: 'bank-account',
		category: 'country-data',
		name: 'tools.bank-account.test_bank_account_generator',
		description: 'tools.bank-account.create_fictional_bank_account_data_for_tes',
		icon: 'building',
		keywords: 'conta bancária banco agência bank account test data cuenta bancaria prueba',
		available: true,

		loadDefinition: () =>
			import('../brazilian/bank-account.tool').then((module) => module.definition),
	},
	{
		id: 'certificate-number',
		category: 'country-data',
		name: 'tools.certificate-number.certificate_record_number_generator',
		description: 'tools.certificate-number.generate_synthetic_certificate_record_numb',
		icon: 'document',
		keywords:
			'certidão nascimento casamento óbito registro civil birth marriage death certificate acta nacimiento certificado',
		available: true,

		loadDefinition: () =>
			import('../brazilian/certificate-number.tool').then((module) => module.definition),
	},
	{
		id: 'ie',
		category: 'country-data',
		name: 'tools.ie.state_registration_validator',
		description: 'tools.ie.check_a_state_registration_using_its_state',
		icon: 'building',
		keywords: 'inscrição estadual ie validator tax registration state validar registro fiscal',
		available: true,

		loadDefinition: () => import('../brazilian/ie.tool').then((module) => module.definition),
	},
	{
		id: 'voter',
		category: 'country-data',
		name: 'tools.voter.voter_registration_validator',
		description: 'tools.voter.check_a_voter_registration_number_s_check_',
		icon: 'document',
		keywords:
			'título eleitoral eleitor validar voter registration validator validar registro electoral',
		available: true,

		loadDefinition: () => import('../brazilian/voter.tool').then((module) => module.definition),
	},
	{
		id: 'nfe',
		category: 'country-data',
		name: 'tools.nfe.nfe_access_key_title',
		description: 'tools.nfe.generate_a_synthetic_nf_e_key_or_check_its',
		icon: 'building',
		keywords:
			'nota fiscal eletrônica chave de acesso nf-e nfe fiscal invoice tax factura electronica',
		available: true,

		loadDefinition: () => import('../brazilian/nfe.tool').then((module) => module.definition),
	},
	{
		id: 'pix',
		category: 'country-data',
		name: 'tools.pix.pix_payload_generator_decoder',
		description: 'tools.pix.generate_or_decode_static_pix_payloads_wit',
		icon: 'arrows',
		keywords: 'pix copia e cola qr code pagamento instantâneo instant payment pago instantaneo',
		available: true,

		loadDefinition: () => import('../brazilian/pix.tool').then((module) => module.definition),
	},
	{
		id: 'boleto',
		category: 'country-data',
		name: 'tools.boleto.boleto_barcode_converter',
		description: 'tools.boleto.validate_and_convert_boleto_payment_lines_',
		icon: 'document',
		keywords:
			'boleto código de barras linha digitável pagamento bancário barcode payment slip comprobante pago',
		available: true,

		loadDefinition: () => import('../brazilian/boleto.tool').then((module) => module.definition),
	},
	{
		id: 'document-mask',
		category: 'country-data',
		name: 'tools.document-mask.brazilian_document_masks',
		description: 'tools.document-mask.add_or_remove_formatting_from_brazilian_do',
		icon: 'document',
		keywords:
			'máscara formatar remover pontuação cpf cnpj telefone cep formatting mask formato documentos',
		available: true,

		loadDefinition: () =>
			import('../brazilian/document-mask.tool').then((module) => module.definition),
	},
];
