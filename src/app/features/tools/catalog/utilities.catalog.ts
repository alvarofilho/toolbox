import { text } from '@app/core/models/tool';
import type { ToolRegistration } from '@app/features/tools/catalog/tool-registration';

export const UTILITIES_TOOLS: readonly ToolRegistration[] = [
	{
		id: 'basic-auth',
		category: 'utilities',
		name: text('Gerador de Basic Auth', 'Basic Auth Generator'),
		description: text(
			'Gere um cabeçalho Basic Auth com usuário e senha.',
			'Generate a Basic Auth header from a username and password.',
			'Genera un encabezado Basic Auth con usuario y contraseña.',
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
		name: text('Analisador de força de senha', 'Password Strength Analyzer'),
		description: text(
			'Estime a força de uma senha de teste com análise local.',
			"Estimate a test password's strength with local analysis.",
			'Estima la fuerza de una contraseña de prueba mediante análisis local.',
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
		name: text('Gerador e validador de OTP', 'OTP Generator and Validator'),
		description: text(
			'Gere ou confira códigos TOTP usando um segredo Base32.',
			'Generate or verify TOTP codes with a Base32 secret.',
			'Genera o verifica códigos TOTP con un secreto Base32.',
		),
		icon: 'code',
		keywords: '',
		available: true,

		loadDefinition: () => import('../utilities/otp.tool').then((module) => module.definition),
	},
	{
		id: 'user-agent',
		category: 'utilities',
		name: text('Analisador de User-Agent', 'User-Agent Parser'),
		description: text(
			'Identifique navegador e plataforma em uma string User-Agent.',
			'Identify browser and platform in a User-Agent string.',
			'Identifica navegador y plataforma en una cadena User-Agent.',
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
		name: text('Gerador de meta tags', 'Meta Tags Generator'),
		description: text(
			'Gere tags de título, descrição e compartilhamento para uma página.',
			'Generate title, description and sharing tags for a page.',
			'Genera etiquetas de título, descripción y uso compartido para una página.',
		),
		icon: 'code',
		keywords: '',
		available: true,

		loadDefinition: () => import('../utilities/meta-tags.tool').then((module) => module.definition),
	},
	{
		id: 'mime-types',
		category: 'utilities',
		name: text('Consulta de MIME types', 'MIME Type Lookup'),
		description: text(
			'Consulte tipos MIME por extensão ou nome do formato.',
			'Look up MIME types by extension or format name.',
			'Consulta tipos MIME por extensión o nombre del formato.',
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
		name: text('Conversor para alfabeto fonético', 'NATO Phonetic Alphabet'),
		description: text(
			'Soletre texto com o alfabeto fonético NATO.',
			'Spell out text with the NATO phonetic alphabet.',
			'Deletrea texto con el alfabeto fonético NATO.',
		),
		icon: 'code',
		keywords: '',
		available: true,

		loadDefinition: () => import('../utilities/nato.tool').then((module) => module.definition),
	},
	{
		id: 'percentage',
		category: 'utilities',
		name: text('Calculadora de porcentagem', 'Percentage Calculator'),
		description: text(
			'Calcule porcentagens, proporções e variações percentuais.',
			'Calculate percentages, ratios and percentage changes.',
			'Calcula porcentajes, proporciones y variaciones porcentuales.',
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
		name: text('Gerador de números aleatórios', 'Random Number Generator'),
		description: text(
			'Gere números inteiros dentro dos limites escolhidos.',
			'Generate integers within your chosen limits.',
			'Genera números enteros dentro de los límites elegidos.',
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
		name: text('Gerador de chaves RSA', 'RSA Key Pair Generator'),
		description: text(
			'Gere um par de chaves RSA pública e privada.',
			'Generate an RSA public and private key pair.',
			'Genera un par de claves RSA pública y privada.',
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
		name: text('Calculadora de expressões', 'Math Expression Evaluator'),
		description: text(
			'Calcule expressões com números, operadores e parênteses.',
			'Evaluate expressions with numbers, operators and parentheses.',
			'Calcula expresiones con números, operadores y paréntesis.',
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
		name: text('Calculadora de regra de três', 'Rule of Three Calculator'),
		description: text(
			'Encontre o quarto valor de uma proporção direta.',
			'Find the fourth value in a direct proportion.',
			'Encuentra el cuarto valor de una proporción directa.',
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
		name: text('Conversor de temperatura', 'Temperature Converter'),
		description: text(
			'Converta temperaturas entre Celsius, Fahrenheit e Kelvin.',
			'Convert temperatures between Celsius, Fahrenheit and Kelvin.',
			'Convierte temperaturas entre Celsius, Fahrenheit y Kelvin.',
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
		name: text('Gerador de appsettings .NET', '.NET AppSettings Generator'),
		description: text(
			'Monte uma connection string em appsettings.json para .NET.',
			'Build a connection string in a .NET appsettings.json file.',
			'Crea una cadena de conexión en appsettings.json para .NET.',
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
		name: text('Gerador de configuração de proxy', 'API Proxy Config Generator'),
		description: text(
			'Gere configuração de proxy para hospedar em Vite ou Nginx.',
			'Generate proxy configuration to host in Vite or Nginx.',
			'Genera configuración de proxy para alojar en Vite o Nginx.',
		),
		icon: 'code',
		keywords: '',
		available: true,

		loadDefinition: () => import('../utilities/api-proxy.tool').then((module) => module.definition),
	},
	{
		id: 'bcrypt',
		category: 'utilities',
		name: text('Gerador e verificador bcrypt', 'Bcrypt Hash and Verify'),
		description: text(
			'Gere hashes bcrypt ou confira uma senha contra um hash.',
			'Generate bcrypt hashes or check a password against a hash.',
			'Genera hashes bcrypt o comprueba una contraseña frente a un hash.',
		),
		icon: 'code',
		keywords: '',
		available: true,

		loadDefinition: () => import('../utilities/bcrypt.tool').then((module) => module.definition),
	},
	{
		id: 'bip39',
		category: 'utilities',
		name: text('Gerador e validador BIP39', 'BIP39 Mnemonic Generator and Validator'),
		description: text(
			'Gere ou valide frases BIP39 em inglês ou espanhol para testes.',
			'Generate or validate English or Spanish BIP39 phrases for testing.',
			'Genera o valida frases BIP39 en inglés o español para pruebas.',
		),
		icon: 'code',
		keywords: '',
		available: true,

		loadDefinition: () => import('../utilities/bip39.tool').then((module) => module.definition),
	},
	{
		id: 'toml-converter',
		category: 'utilities',
		name: text('Conversor JSON, YAML e TOML', 'JSON, YAML and TOML Converter'),
		description: text(
			'Converta documentos entre JSON, YAML e TOML.',
			'Convert documents between JSON, YAML and TOML.',
			'Convierte documentos entre JSON, YAML y TOML.',
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
		name: text('Visualizador de HTML seguro', 'Safe HTML Preview'),
		description: text(
			'Veja uma prévia de HTML sanitizado em ambiente isolado.',
			'Preview sanitized HTML in an isolated environment.',
			'Previsualiza HTML saneado en un entorno aislado.',
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
		name: text('Informações do dispositivo', 'Device Information'),
		description: text(
			'Consulte informações do navegador e do dispositivo atual.',
			'Inspect current browser and device information.',
			'Consulta información del navegador y dispositivo actual.',
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
		name: text('Identificador de tecla', 'Keyboard Key Identifier'),
		description: text(
			'Inspecione os valores key e code de um evento de teclado.',
			'Inspect the key and code values of a keyboard event.',
			'Inspecciona los valores key y code de un evento de teclado.',
		),
		icon: 'code',
		keywords: '',
		available: true,

		loadDefinition: () => import('../utilities/keycode.tool').then((module) => module.definition),
	},
	{
		id: 'safe-link',
		category: 'utilities',
		name: text('Decodificador de links seguros', 'Safe Link Decoder'),
		description: text(
			'Extraia a URL original de um link de proteção compatível.',
			'Extract the original URL from a supported protected link.',
			'Extrae la URL original de un enlace protegido compatible.',
		),
		icon: 'code',
		keywords: '',
		available: true,

		loadDefinition: () => import('../utilities/safe-link.tool').then((module) => module.definition),
	},
];
