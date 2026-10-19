import { text } from '@app/core/models/tool';
import type { ToolRegistration } from '@app/features/tools/catalog/tool-registration';

export const UTILITIES_TOOLS: readonly ToolRegistration[] = [
	{
		id: 'basic-auth',
		category: 'utilities',
		name: text('Gerador de Basic Auth', 'Basic Auth Generator', undefined, 'tools.basic-auth'),
		description: text(
			'Gere um cabeçalho Basic Auth com usuário e senha.',
			'Generate a Basic Auth header from a username and password.',
			'Genera un encabezado Basic Auth con usuario y contraseña.',
			'tools.basic-auth',
		),
		icon: 'code',
		keywords: '',
		available: true,

		loadDefinition: () =>
			import('../utilities/basic-auth.tool').then((module) => module.definition),
	},
	{
		id: 'password-strength',
		category: 'utilities',
		name: text(
			'Analisador de força de senha',
			'Password Strength Analyzer',
			undefined,
			'tools.password-strength',
		),
		description: text(
			'Estime a força de uma senha de teste com análise local.',
			"Estimate a test password's strength with local analysis.",
			'Estima la fuerza de una contraseña de prueba mediante análisis local.',
			'tools.password-strength',
		),
		icon: 'code',
		keywords: '',
		available: true,

		loadDefinition: () =>
			import('../utilities/password-strength.tool').then((module) => module.definition),
	},
	{
		id: 'otp',
		category: 'utilities',
		name: text('Gerador e validador de OTP', 'OTP Generator and Validator', undefined, 'tools.otp'),
		description: text(
			'Gere ou confira códigos TOTP usando um segredo Base32.',
			'Generate or verify TOTP codes with a Base32 secret.',
			'Genera o verifica códigos TOTP con un secreto Base32.',
			'tools.otp',
		),
		icon: 'code',
		keywords: '',
		available: true,

		loadDefinition: () => import('../utilities/otp.tool').then((module) => module.definition),
	},
	{
		id: 'user-agent',
		category: 'utilities',
		name: text('Analisador de User-Agent', 'User-Agent Parser', undefined, 'tools.user-agent'),
		description: text(
			'Identifique navegador e plataforma em uma string User-Agent.',
			'Identify browser and platform in a User-Agent string.',
			'Identifica navegador y plataforma en una cadena User-Agent.',
			'tools.user-agent',
		),
		icon: 'code',
		keywords: '',
		available: true,

		loadDefinition: () =>
			import('../utilities/user-agent.tool').then((module) => module.definition),
	},
	{
		id: 'meta-tags',
		category: 'utilities',
		name: text('Gerador de meta tags', 'Meta Tags Generator', undefined, 'tools.meta-tags'),
		description: text(
			'Gere tags de título, descrição e compartilhamento para uma página.',
			'Generate title, description and sharing tags for a page.',
			'Genera etiquetas de título, descripción y uso compartido para una página.',
			'tools.meta-tags',
		),
		icon: 'code',
		keywords: '',
		available: true,

		loadDefinition: () => import('../utilities/meta-tags.tool').then((module) => module.definition),
	},
	{
		id: 'mime-types',
		category: 'utilities',
		name: text('Consulta de MIME types', 'MIME Type Lookup', undefined, 'tools.mime-types'),
		description: text(
			'Consulte tipos MIME por extensão ou nome do formato.',
			'Look up MIME types by extension or format name.',
			'Consulta tipos MIME por extensión o nombre del formato.',
			'tools.mime-types',
		),
		icon: 'code',
		keywords: '',
		available: true,

		loadDefinition: () =>
			import('../utilities/mime-types.tool').then((module) => module.definition),
	},
	{
		id: 'nato',
		category: 'utilities',
		name: text(
			'Conversor para alfabeto fonético',
			'NATO Phonetic Alphabet',
			undefined,
			'tools.nato',
		),
		description: text(
			'Soletre texto com o alfabeto fonético NATO.',
			'Spell out text with the NATO phonetic alphabet.',
			'Deletrea texto con el alfabeto fonético NATO.',
			'tools.nato',
		),
		icon: 'code',
		keywords: '',
		available: true,

		loadDefinition: () => import('../utilities/nato.tool').then((module) => module.definition),
	},
	{
		id: 'percentage',
		category: 'utilities',
		name: text(
			'Calculadora de porcentagem',
			'Percentage Calculator',
			undefined,
			'tools.percentage',
		),
		description: text(
			'Calcule porcentagens, proporções e variações percentuais.',
			'Calculate percentages, ratios and percentage changes.',
			'Calcula porcentajes, proporciones y variaciones porcentuales.',
			'tools.percentage',
		),
		icon: 'code',
		keywords: '',
		available: true,

		loadDefinition: () =>
			import('../utilities/percentage.tool').then((module) => module.definition),
	},
	{
		id: 'random-number',
		category: 'utilities',
		name: text(
			'Gerador de números aleatórios',
			'Random Number Generator',
			undefined,
			'tools.random-number',
		),
		description: text(
			'Gere números inteiros dentro dos limites escolhidos.',
			'Generate integers within your chosen limits.',
			'Genera números enteros dentro de los límites elegidos.',
			'tools.random-number',
		),
		icon: 'code',
		keywords: '',
		available: true,

		loadDefinition: () =>
			import('../utilities/random-number.tool').then((module) => module.definition),
	},
	{
		id: 'rsa-keypair',
		category: 'utilities',
		name: text('Gerador de chaves RSA', 'RSA Key Pair Generator', undefined, 'tools.rsa-keypair'),
		description: text(
			'Gere um par de chaves RSA pública e privada.',
			'Generate an RSA public and private key pair.',
			'Genera un par de claves RSA pública y privada.',
			'tools.rsa-keypair',
		),
		icon: 'code',
		keywords: '',
		available: true,

		loadDefinition: () =>
			import('../utilities/rsa-keypair.tool').then((module) => module.definition),
	},
	{
		id: 'math-evaluator',
		category: 'utilities',
		name: text(
			'Calculadora de expressões',
			'Math Expression Evaluator',
			undefined,
			'tools.math-evaluator',
		),
		description: text(
			'Calcule expressões com números, operadores e parênteses.',
			'Evaluate expressions with numbers, operators and parentheses.',
			'Calcula expresiones con números, operadores y paréntesis.',
			'tools.math-evaluator',
		),
		icon: 'code',
		keywords: '',
		available: true,

		loadDefinition: () =>
			import('../utilities/math-evaluator.tool').then((module) => module.definition),
	},
	{
		id: 'rule-of-three',
		category: 'utilities',
		name: text(
			'Calculadora de regra de três',
			'Rule of Three Calculator',
			undefined,
			'tools.rule-of-three',
		),
		description: text(
			'Encontre o quarto valor de uma proporção direta.',
			'Find the fourth value in a direct proportion.',
			'Encuentra el cuarto valor de una proporción directa.',
			'tools.rule-of-three',
		),
		icon: 'code',
		keywords: '',
		available: true,

		loadDefinition: () =>
			import('../utilities/rule-of-three.tool').then((module) => module.definition),
	},
	{
		id: 'temperature',
		category: 'utilities',
		name: text('Conversor de temperatura', 'Temperature Converter', undefined, 'tools.temperature'),
		description: text(
			'Converta temperaturas entre Celsius, Fahrenheit e Kelvin.',
			'Convert temperatures between Celsius, Fahrenheit and Kelvin.',
			'Convierte temperaturas entre Celsius, Fahrenheit y Kelvin.',
			'tools.temperature',
		),
		icon: 'code',
		keywords: '',
		available: true,

		loadDefinition: () =>
			import('../utilities/temperature.tool').then((module) => module.definition),
	},
	{
		id: 'dotnet-appsettings',
		category: 'utilities',
		name: text(
			'Gerador de appsettings .NET',
			'.NET AppSettings Generator',
			undefined,
			'tools.dotnet-appsettings',
		),
		description: text(
			'Monte uma connection string em appsettings.json para .NET.',
			'Build a connection string in a .NET appsettings.json file.',
			'Crea una cadena de conexión en appsettings.json para .NET.',
			'tools.dotnet-appsettings',
		),
		icon: 'code',
		keywords: '',
		available: true,

		loadDefinition: () =>
			import('../utilities/dotnet-appsettings.tool').then((module) => module.definition),
	},
	{
		id: 'api-proxy',
		category: 'utilities',
		name: text(
			'Gerador de configuração de proxy',
			'API Proxy Config Generator',
			undefined,
			'tools.api-proxy',
		),
		description: text(
			'Gere configuração de proxy para hospedar em Vite ou Nginx.',
			'Generate proxy configuration to host in Vite or Nginx.',
			'Genera configuración de proxy para alojar en Vite o Nginx.',
			'tools.api-proxy',
		),
		icon: 'code',
		keywords: '',
		available: true,

		loadDefinition: () => import('../utilities/api-proxy.tool').then((module) => module.definition),
	},
	{
		id: 'bcrypt',
		category: 'utilities',
		name: text('Gerador e verificador bcrypt', 'Bcrypt Hash and Verify', undefined, 'tools.bcrypt'),
		description: text(
			'Gere hashes bcrypt ou confira uma senha contra um hash.',
			'Generate bcrypt hashes or check a password against a hash.',
			'Genera hashes bcrypt o comprueba una contraseña frente a un hash.',
			'tools.bcrypt',
		),
		icon: 'code',
		keywords: '',
		available: true,

		loadDefinition: () => import('../utilities/bcrypt.tool').then((module) => module.definition),
	},
	{
		id: 'bip39',
		category: 'utilities',
		name: text(
			'Gerador e validador BIP39',
			'BIP39 Mnemonic Generator and Validator',
			undefined,
			'tools.bip39',
		),
		description: text(
			'Gere ou valide frases BIP39 em inglês ou espanhol para testes.',
			'Generate or validate English or Spanish BIP39 phrases for testing.',
			'Genera o valida frases BIP39 en inglés o español para pruebas.',
			'tools.bip39',
		),
		icon: 'code',
		keywords: '',
		available: true,

		loadDefinition: () => import('../utilities/bip39.tool').then((module) => module.definition),
	},
	{
		id: 'toml-converter',
		category: 'utilities',
		name: text(
			'Conversor JSON, YAML e TOML',
			'JSON, YAML and TOML Converter',
			undefined,
			'tools.toml-converter',
		),
		description: text(
			'Converta documentos entre JSON, YAML e TOML.',
			'Convert documents between JSON, YAML and TOML.',
			'Convierte documentos entre JSON, YAML y TOML.',
			'tools.toml-converter',
		),
		icon: 'code',
		keywords: '',
		available: true,

		loadDefinition: () =>
			import('../utilities/toml-converter.tool').then((module) => module.definition),
	},
	{
		id: 'html-editor',
		category: 'utilities',
		name: text('Visualizador de HTML seguro', 'Safe HTML Preview', undefined, 'tools.html-editor'),
		description: text(
			'Veja uma prévia de HTML sanitizado em ambiente isolado.',
			'Preview sanitized HTML in an isolated environment.',
			'Previsualiza HTML saneado en un entorno aislado.',
			'tools.html-editor',
		),
		icon: 'code',
		keywords: '',
		available: true,

		loadDefinition: () =>
			import('../utilities/html-editor.tool').then((module) => module.definition),
	},
	{
		id: 'device-info',
		category: 'utilities',
		name: text('Informações do dispositivo', 'Device Information', undefined, 'tools.device-info'),
		description: text(
			'Consulte informações do navegador e do dispositivo atual.',
			'Inspect current browser and device information.',
			'Consulta información del navegador y dispositivo actual.',
			'tools.device-info',
		),
		icon: 'code',
		keywords: '',
		available: true,

		loadDefinition: () =>
			import('../utilities/device-info.tool').then((module) => module.definition),
	},
	{
		id: 'keycode',
		category: 'utilities',
		name: text('Identificador de tecla', 'Keyboard Key Identifier', undefined, 'tools.keycode'),
		description: text(
			'Inspecione os valores key e code de um evento de teclado.',
			'Inspect the key and code values of a keyboard event.',
			'Inspecciona los valores key y code de un evento de teclado.',
			'tools.keycode',
		),
		icon: 'code',
		keywords: '',
		available: true,

		loadDefinition: () => import('../utilities/keycode.tool').then((module) => module.definition),
	},
	{
		id: 'safe-link',
		category: 'utilities',
		name: text('Decodificador de links seguros', 'Safe Link Decoder', undefined, 'tools.safe-link'),
		description: text(
			'Extraia a URL original de um link de proteção compatível.',
			'Extract the original URL from a supported protected link.',
			'Extrae la URL original de un enlace protegido compatible.',
			'tools.safe-link',
		),
		icon: 'code',
		keywords: '',
		available: true,

		loadDefinition: () => import('../utilities/safe-link.tool').then((module) => module.definition),
	},
];
