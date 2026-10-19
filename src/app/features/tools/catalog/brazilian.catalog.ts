import { text } from '@app/core/models/tool';
import type { ToolRegistration } from '@app/features/tools/catalog/tool-registration';

export const BRAZILIAN_TOOLS: readonly ToolRegistration[] = [
	{
		id: 'cpf',
		name: text('Gerador e validador de CPF', 'CPF Generator & Validator', undefined, 'tools.cpf'),
		description: text(
			'Gere CPFs para testes e valide seus dígitos.',
			'Generate test CPFs and validate check digits.',
			undefined,
			'tools.cpf',
		),
		category: 'brazilian',
		icon: 'document',
		keywords: 'brasil documento pessoa fisica brazil',
		available: true,
		loadDefinition: () => import('../brazilian/cpf.tool').then((module) => module.definition),
	},
	{
		id: 'cnpj',
		name: text(
			'Gerador e validador de CNPJ',
			'CNPJ Generator & Validator',
			undefined,
			'tools.cnpj',
		),
		description: text(
			'CNPJ numérico e alfanumérico, prontos para testes.',
			'Numeric and alphanumeric CNPJ for testing.',
			undefined,
			'tools.cnpj',
		),
		category: 'brazilian',
		icon: 'building',
		keywords: 'brasil empresa juridica alfanumerico brazil',
		available: true,

		loadDefinition: () => import('../brazilian/cnpj.tool').then((module) => module.definition),
	},
	{
		id: 'person',
		name: text('Gerador de pessoas', 'Fake Person Generator', undefined, 'tools.person'),
		description: text(
			'Dados brasileiros sintéticos em JSON, CSV ou SQL.',
			'Synthetic Brazilian data in JSON, CSV or SQL.',
			undefined,
			'tools.person',
		),
		category: 'brazilian',
		icon: 'users',
		keywords: 'fake faker pessoa massa seed brasileiro email telefone',
		available: true,

		loadDefinition: () => import('../brazilian/person.tool').then((module) => module.definition),
	},
	{
		id: 'pis',
		category: 'brazilian',
		name: text('Validador de PIS/PASEP', 'PIS/PASEP Validator', undefined, 'tools.pis'),
		description: text(
			'Confira os dígitos verificadores de um PIS/PASEP.',
			"Check a PIS/PASEP number's check digits.",
			'Comprueba los dígitos de control de un PIS/PASEP.',
			'tools.pis',
		),
		icon: 'code',
		keywords: '',
		available: true,

		loadDefinition: () => import('../brazilian/pis.tool').then((module) => module.definition),
	},
	{
		id: 'cnh',
		category: 'brazilian',
		name: text('Validador de CNH', 'CNH Validator', undefined, 'tools.cnh'),
		description: text(
			'Confira os dígitos verificadores de uma CNH.',
			"Check a CNH number's check digits.",
			'Comprueba los dígitos de control de una CNH.',
			'tools.cnh',
		),
		icon: 'code',
		keywords: '',
		available: true,

		loadDefinition: () => import('../brazilian/cnh.tool').then((module) => module.definition),
	},
	{
		id: 'pis-generator',
		category: 'brazilian',
		name: text('Gerador de PIS/PASEP', 'PIS/PASEP Generator', undefined, 'tools.pis-generator'),
		description: text(
			'Gere números PIS/PASEP sintéticos para testes.',
			'Generate synthetic PIS/PASEP numbers for testing.',
			'Genera números PIS/PASEP sintéticos para pruebas.',
			'tools.pis-generator',
		),
		icon: 'code',
		keywords: '',
		available: true,

		loadDefinition: () =>
			import('../brazilian/pis-generator.tool').then((module) => module.definition),
	},
	{
		id: 'cnh-generator',
		category: 'brazilian',
		name: text('Gerador de CNH', 'CNH Generator', undefined, 'tools.cnh-generator'),
		description: text(
			'Gere números CNH sintéticos para testes.',
			'Generate synthetic CNH numbers for testing.',
			'Genera números CNH sintéticos para pruebas.',
			'tools.cnh-generator',
		),
		icon: 'code',
		keywords: '',
		available: true,

		loadDefinition: () =>
			import('../brazilian/cnh-generator.tool').then((module) => module.definition),
	},
	{
		id: 'voter-generator',
		category: 'brazilian',
		name: text(
			'Gerador de título de eleitor',
			'Voter Registration Generator',
			undefined,
			'tools.voter-generator',
		),
		description: text(
			'Gere títulos eleitorais sintéticos para testes.',
			'Generate synthetic voter registrations for testing.',
			'Genera registros electorales sintéticos para pruebas.',
			'tools.voter-generator',
		),
		icon: 'code',
		keywords: '',
		available: true,

		loadDefinition: () =>
			import('../brazilian/voter-generator.tool').then((module) => module.definition),
	},
	{
		id: 'rg-generator',
		category: 'brazilian',
		name: text(
			'Gerador de RG sintético',
			'Synthetic RG Generator',
			undefined,
			'tools.rg-generator',
		),
		description: text(
			'Crie números RG fictícios sem comprovação cadastral.',
			'Create fictional RG numbers without registration checks.',
			'Crea números RG ficticios sin comprobación de registro.',
			'tools.rg-generator',
		),
		icon: 'code',
		keywords: '',
		available: true,

		loadDefinition: () =>
			import('../brazilian/rg-generator.tool').then((module) => module.definition),
	},
	{
		id: 'ie-generator',
		category: 'brazilian',
		name: text(
			'Gerador de inscrição estadual',
			'State Registration Generator',
			undefined,
			'tools.ie-generator',
		),
		description: text(
			'Gere inscrições estaduais sintéticas para a UF escolhida.',
			'Generate synthetic state registrations for your chosen state.',
			'Genera inscripciones estatales sintéticas para el estado elegido.',
			'tools.ie-generator',
		),
		icon: 'code',
		keywords: '',
		available: true,

		loadDefinition: () =>
			import('../brazilian/ie-generator.tool').then((module) => module.definition),
	},
	{
		id: 'renavam',
		category: 'brazilian',
		name: text(
			'Gerador e validador de RENAVAM',
			'RENAVAM Generator and Validator',
			undefined,
			'tools.renavam',
		),
		description: text(
			'Gere RENAVAM sintético ou confira seus dígitos.',
			'Generate synthetic RENAVAM numbers or check their digits.',
			'Genera RENAVAM sintético o comprueba sus dígitos.',
			'tools.renavam',
		),
		icon: 'code',
		keywords: '',
		available: true,

		loadDefinition: () => import('../brazilian/renavam.tool').then((module) => module.definition),
	},
	{
		id: 'plate',
		category: 'brazilian',
		name: text(
			'Gerador e validador de placas',
			'Vehicle Plate Generator and Validator',
			undefined,
			'tools.plate',
		),
		description: text(
			'Gere placas fictícias ou confira o formato de uma placa.',
			"Generate fictional plates or check a plate's format.",
			'Genera matrículas ficticias o comprueba su formato.',
			'tools.plate',
		),
		icon: 'code',
		keywords: '',
		available: true,

		loadDefinition: () => import('../brazilian/plate.tool').then((module) => module.definition),
	},
	{
		id: 'credit-card',
		category: 'brazilian',
		name: text(
			'Gerador e validador de cartão de teste',
			'Test Card Generator and Validator',
			undefined,
			'tools.credit-card',
		),
		description: text(
			'Gere cartões de teste ou confira dígitos pelo algoritmo Luhn.',
			'Generate test card numbers or check their Luhn digits.',
			'Genera tarjetas de prueba o comprueba sus dígitos Luhn.',
			'tools.credit-card',
		),
		icon: 'code',
		keywords: '',
		available: true,

		loadDefinition: () =>
			import('../brazilian/credit-card.tool').then((module) => module.definition),
	},
	{
		id: 'bank-account',
		category: 'brazilian',
		name: text(
			'Gerador de conta bancária de teste',
			'Test Bank Account Generator',
			undefined,
			'tools.bank-account',
		),
		description: text(
			'Crie dados fictícios de conta bancária para testes.',
			'Create fictional bank account data for testing.',
			'Crea datos ficticios de cuentas bancarias para pruebas.',
			'tools.bank-account',
		),
		icon: 'code',
		keywords: '',
		available: true,

		loadDefinition: () =>
			import('../brazilian/bank-account.tool').then((module) => module.definition),
	},
	{
		id: 'certificate-number',
		category: 'brazilian',
		name: text(
			'Gerador de matrícula de certidão',
			'Certificate Record Number Generator',
			undefined,
			'tools.certificate-number',
		),
		description: text(
			'Gere matrículas de certidão com formato sintético.',
			'Generate synthetic certificate record number formats.',
			'Genera números de registro de certificados con formato sintético.',
			'tools.certificate-number',
		),
		icon: 'code',
		keywords: '',
		available: true,

		loadDefinition: () =>
			import('../brazilian/certificate-number.tool').then((module) => module.definition),
	},
	{
		id: 'ie',
		category: 'brazilian',
		name: text('Inscrição Estadual por UF', 'State Registration Validator', undefined, 'tools.ie'),
		description: text(
			'Confira uma inscrição estadual pelo algoritmo da UF.',
			"Check a state registration using its state's algorithm.",
			'Comprueba una inscripción estatal con el algoritmo de su estado.',
			'tools.ie',
		),
		icon: 'code',
		keywords: '',
		available: true,

		loadDefinition: () => import('../brazilian/ie.tool').then((module) => module.definition),
	},
	{
		id: 'voter',
		category: 'brazilian',
		name: text(
			'Validador de Título de Eleitor',
			'Voter Registration Validator',
			undefined,
			'tools.voter',
		),
		description: text(
			'Confira os dígitos de um título de eleitor.',
			"Check a voter registration number's check digits.",
			'Comprueba los dígitos de un registro electoral.',
			'tools.voter',
		),
		icon: 'code',
		keywords: '',
		available: true,

		loadDefinition: () => import('../brazilian/voter.tool').then((module) => module.definition),
	},
	{
		id: 'nfe',
		category: 'brazilian',
		name: text('Chave de acesso NF-e', 'NF-e Access Key', undefined, 'tools.nfe'),
		description: text(
			'Gere uma chave NF-e sintética ou confira seu dígito.',
			'Generate a synthetic NF-e key or check its digit.',
			'Genera una clave NF-e sintética o comprueba su dígito.',
			'tools.nfe',
		),
		icon: 'code',
		keywords: '',
		available: true,

		loadDefinition: () => import('../brazilian/nfe.tool').then((module) => module.definition),
	},
	{
		id: 'pix',
		category: 'brazilian',
		name: text(
			'PIX Copia e Cola Generator/Decoder',
			'PIX Payload Generator/Decoder',
			undefined,
			'tools.pix',
		),
		description: text(
			'Gere ou decodifique PIX estático com conferência do CRC.',
			'Generate or decode static PIX payloads with CRC checks.',
			'Genera o decodifica códigos PIX estáticos y comprueba su CRC.',
			'tools.pix',
		),
		icon: 'code',
		keywords: '',
		available: true,

		loadDefinition: () => import('../brazilian/pix.tool').then((module) => module.definition),
	},
	{
		id: 'boleto',
		category: 'brazilian',
		name: text(
			'Conversor de linha digitável de boleto',
			'Boleto Barcode Converter',
			undefined,
			'tools.boleto',
		),
		description: text(
			'Valide e converta linha digitável e código de barras de boleto.',
			'Validate and convert boleto payment lines and barcodes.',
			'Valida y convierte líneas de pago y códigos de barras de boleto.',
			'tools.boleto',
		),
		icon: 'code',
		keywords: '',
		available: true,

		loadDefinition: () => import('../brazilian/boleto.tool').then((module) => module.definition),
	},
	{
		id: 'document-mask',
		category: 'brazilian',
		name: text(
			'Máscaras de documentos brasileiros',
			'Brazilian Document Masks',
			undefined,
			'tools.document-mask',
		),
		description: text(
			'Aplique ou remova pontuação de documentos brasileiros.',
			'Add or remove formatting from Brazilian documents.',
			'Aplica o elimina el formato de documentos brasileños.',
			'tools.document-mask',
		),
		icon: 'code',
		keywords: '',
		available: true,

		loadDefinition: () =>
			import('../brazilian/document-mask.tool').then((module) => module.definition),
	},
];
