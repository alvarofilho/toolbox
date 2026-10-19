import {
	text,
	type ToolControl,
	type ToolDefinition,
	type ToolInfo,
	type ToolValues,
} from '@app/core/models/tool';

// Execution is opt-in: generators, crypto, file operations and expensive parsers stay manual.
const automatic = new Set([
	'base64',
	'url',
	'case',
	'timestamp',
	'json-formatter',
	'json-minifier',
	'json-validator',
	'html-entities',
	'unicode',
	'hex',
	'base-converter',
	'date',
	'timezone',
	'text-binary',
	'binary-text',
	'punycode',
	'word-count',
	'dedupe-lines',
	'sort-lines',
	'slug',
	'percentage',
	'rule-of-three',
	'temperature',
	'color',
	'gradient',
	'box-shadow',
	'clamp',
	'flexbox',
	'css-grid',
	'contrast',
	'guid-formatter',
	'pascal-camel',
	'csharp-escape',
]);

type InputPresentation = readonly [
	string,
	string,
	string,
	ToolControl['type']?,
	string?,
	ToolControl['inputMode']?,
];
const actions: Readonly<Record<string, readonly [string, string, string]>> = {
	qr: ['Gerar QR Code', 'Generate QR Code', 'Generar QR'],
	person: ['Gerar pessoas', 'Generate people', 'Generar personas'],
	company: ['Gerar empresas', 'Generate companies', 'Generar empresas'],
	address: ['Gerar endereços', 'Generate addresses', 'Generar direcciones'],
	email: ['Gerar e-mails', 'Generate emails', 'Generar correos'],
	phone: ['Gerar telefones', 'Generate phone numbers', 'Generar teléfonos'],
	ulid: ['Gerar ULIDs', 'Generate ULIDs', 'Generar ULID'],
	guid: ['Gerar GUIDs', 'Generate GUIDs', 'Generar GUID'],
	'json-viewer': ['Explorar JSON', 'Explore JSON', 'Explorar JSON'],
	jsonpath: ['Extrair valores', 'Extract values', 'Extraer valores'],
	'json-typescript': [
		'Gerar tipos TypeScript',
		'Generate TypeScript types',
		'Generar tipos TypeScript',
	],
	'json-csharp': ['Gerar classes C#', 'Generate C# classes', 'Generar clases C#'],
	'json-csharp-interface': [
		'Gerar interfaces C#',
		'Generate C# interfaces',
		'Generar interfaces C#',
	],
	'ddl-csharp': ['Gerar classes C#', 'Generate C# classes', 'Generar clases C#'],
	'sql-insert': ['Gerar SQL INSERT', 'Generate SQL INSERT', 'Generar SQL INSERT'],
	'json-sql': ['Gerar SQL INSERT', 'Generate SQL INSERT', 'Generar SQL INSERT'],
	hmac: ['Calcular HMAC', 'Calculate HMAC', 'Calcular HMAC'],
	'file-hash': ['Calcular hash do arquivo', 'Hash file', 'Calcular hash del archivo'],
	sri: ['Gerar atributo integrity', 'Generate integrity attribute', 'Generar atributo integrity'],
	'p12-explorer': ['Abrir P12', 'Open P12', 'Abrir P12'],
	'p7b-bundle': ['Criar pacote P7B', 'Build P7B bundle', 'Crear paquete P7B'],
	'webhook-signature': ['Gerar assinatura', 'Generate signature', 'Generar firma'],
	'timestamp-request': ['Criar solicitação', 'Create request', 'Crear solicitud'],
	'http-status': ['Consultar código HTTP', 'Look up HTTP status', 'Consultar código HTTP'],
	'http-headers': ['Analisar cabeçalhos', 'Inspect headers', 'Analizar encabezados'],
	'basic-auth': ['Gerar Basic Auth', 'Generate Basic Auth', 'Generar Basic Auth'],
	'password-strength': ['Analisar senha', 'Analyze password', 'Analizar contraseña'],
	'user-agent': ['Analisar User-Agent', 'Inspect User-Agent', 'Analizar User-Agent'],
	'mime-types': ['Consultar tipo MIME', 'Look up MIME type', 'Consultar tipo MIME'],
	percentage: ['Calcular porcentagem', 'Calculate percentage', 'Calcular porcentaje'],
	'rule-of-three': ['Calcular proporção', 'Calculate proportion', 'Calcular proporción'],
	'math-evaluator': ['Calcular expressão', 'Evaluate expression', 'Calcular expresión'],
	'device-info': ['Consultar dispositivo', 'Inspect device', 'Consultar dispositivo'],
	keycode: ['Inspecionar tecla', 'Inspect key', 'Inspeccionar tecla'],
	'connection-string': [
		'Gerar connection string',
		'Build connection string',
		'Crear cadena de conexión',
	],
	'svg-optimizer': ['Otimizar SVG', 'Optimize SVG', 'Optimizar SVG'],
	'image-converter': ['Converter imagem', 'Convert image', 'Convertir imagen'],
	'image-compressor': ['Comprimir imagem', 'Compress image', 'Comprimir imagen'],
	'image-exif': ['Ler metadados EXIF', 'Read EXIF metadata', 'Leer metadatos EXIF'],
	'pdf-metadata': ['Ler metadados do PDF', 'Read PDF metadata', 'Leer metadatos del PDF'],
	'file-signature': ['Identificar formato', 'Identify format', 'Identificar formato'],
	favicon: ['Gerar ícones', 'Generate icons', 'Generar iconos'],
};
const inputs: Readonly<Record<string, InputPresentation>> = {
	'json-formatter': ['JSON de entrada', 'Input JSON', 'JSON de entrada'],
	'json-minifier': ['JSON de entrada', 'Input JSON', 'JSON de entrada'],
	'json-validator': ['JSON para validar', 'JSON to validate', 'JSON para validar'],
	'json-viewer': ['JSON para explorar', 'JSON to explore', 'JSON para explorar'],
	jsonpath: ['Documento JSON', 'JSON document', 'Documento JSON'],
	'json-schema': ['Documento JSON', 'JSON document', 'Documento JSON'],
	'schema-faker': ['JSON Schema', 'JSON Schema', 'JSON Schema'],
	'json-typescript': ['Objeto ou lista JSON', 'JSON object or array', 'Objeto o lista JSON'],
	'json-csharp': ['Objeto JSON', 'JSON object', 'Objeto JSON'],
	'json-csharp-interface': ['Objeto JSON', 'JSON object', 'Objeto JSON'],
	'json-csv': ['Lista de objetos JSON', 'JSON array of objects', 'Lista de objetos JSON'],
	'csv-json': ['CSV com cabeçalho', 'CSV with headers', 'CSV con encabezado'],
	'json-to-yaml': ['JSON de entrada', 'Input JSON', 'JSON de entrada'],
	'yaml-to-json': ['YAML de entrada', 'Input YAML', 'YAML de entrada'],
	'json-xml': ['Objeto JSON', 'JSON object', 'Objeto JSON'],
	'json-sql': ['Lista de objetos JSON', 'JSON array of objects', 'Lista de objetos JSON'],
	'sql-insert': ['Lista de objetos JSON', 'JSON array of objects', 'Lista de objetos JSON'],
	jwt: ['Token JWT', 'JWT token', 'Token JWT', 'textarea', 'eyJ…'],
	'jwt-claims': ['Token JWT', 'JWT token', 'Token JWT', 'textarea', 'eyJ…'],
	pem: ['Conteúdo PEM', 'PEM content', 'Contenido PEM', 'textarea', '-----BEGIN CERTIFICATE-----'],
	'pem-jwk': ['Certificado ou chave PEM', 'PEM certificate or key', 'Certificado o clave PEM'],
	asn1: ['DER em Base64', 'Base64 DER', 'DER en Base64'],
	x509: ['Certificado PEM', 'PEM certificate', 'Certificado PEM'],
	csr: ['Solicitação CSR em PEM', 'PEM CSR request', 'Solicitud CSR en PEM'],
	'certificate-chain': [
		'Certificados PEM da cadeia',
		'PEM certificate chain',
		'Cadena de certificados PEM',
	],
	'p7b-bundle': ['Certificados PEM', 'PEM certificates', 'Certificados PEM'],
	'p7b-explorer': [
		'Pacote P7B em Base64 ou PEM',
		'P7B bundle as Base64 or PEM',
		'Paquete P7B en Base64 o PEM',
	],
	'crl-explorer': ['CRL em Base64 ou PEM', 'CRL as Base64 or PEM', 'CRL en Base64 o PEM'],
	'timestamp-request': ['Texto para carimbar', 'Text to timestamp', 'Texto para sellar'],
	'tsr-decoder': ['Resposta TSR em Base64', 'Base64 TSR response', 'Respuesta TSR en Base64'],
	cpf: [
		'CPF para validar',
		'CPF to validate',
		'CPF para validar',
		'text',
		'529.982.247-25',
		'numeric',
	],
	cnpj: [
		'CNPJ para validar',
		'CNPJ to validate',
		'CNPJ para validar',
		'text',
		'12.ABC.345/01DE-35',
	],
	pis: ['PIS/PASEP', 'PIS/PASEP', 'PIS/PASEP', 'text', '', 'numeric'],
	cnh: ['CNH', 'CNH', 'CNH', 'text', '', 'numeric'],
	voter: ['Título de eleitor', 'Voter registration', 'Registro electoral', 'text', '', 'numeric'],
	ie: ['Inscrição estadual', 'State registration', 'Inscripción estatal', 'text'],
	nfe: ['Chave de acesso NF-e', 'NF-e access key', 'Clave de acceso NF-e', 'text', '', 'numeric'],
	renavam: [
		'RENAVAM para validar',
		'RENAVAM to validate',
		'RENAVAM para validar',
		'text',
		'',
		'numeric',
	],
	plate: ['Placa para validar', 'Plate to validate', 'Matrícula para validar', 'text', 'ABC1D23'],
	'credit-card': [
		'Número do cartão de teste',
		'Test card number',
		'Número de tarjeta de prueba',
		'text',
		'',
		'numeric',
	],
	pix: ['Código PIX Copia e Cola', 'PIX copy-and-paste code', 'Código PIX para copiar y pegar'],
	boleto: [
		'Linha digitável ou código de barras',
		'Payment line or barcode',
		'Línea de pago o código de barras',
		'text',
		'',
		'numeric',
	],
	'document-mask': ['Número para formatar', 'Number to format', 'Número para formatear', 'text'],
	color: ['Cor CSS', 'CSS color', 'Color CSS', 'text', '#285d45'],
	'base-converter': [
		'Número na base de origem',
		'Number in the input base',
		'Número en la base de origen',
		'text',
		'255',
	],
	date: ['Data para converter', 'Date to convert', 'Fecha para convertir', 'text', '2026-10-19'],
	chmod: ['Permissões em octal', 'Octal permissions', 'Permisos octales', 'text', '755', 'numeric'],
	ipv4: [
		'Endereço IPv4/CIDR',
		'IPv4/CIDR address',
		'Dirección IPv4/CIDR',
		'text',
		'192.168.1.10/24',
	],
	cidr: ['Bloco CIDR', 'CIDR block', 'Bloque CIDR', 'text', '10.0.0.0/16'],
	ipv6: [
		'Endereço IPv6/CIDR',
		'IPv6/CIDR address',
		'Dirección IPv6/CIDR',
		'text',
		'2001:db8::1/64',
	],
	semver: ['Versão original', 'Original version', 'Versión original', 'text', '1.2.3'],
	'password-strength': ['Senha de teste', 'Test password', 'Contraseña de prueba', 'password'],
	'math-evaluator': [
		'Expressão matemática',
		'Math expression',
		'Expresión matemática',
		'text',
		'(10 + 5) / 3',
	],
	'mime-types': [
		'Extensão ou MIME type',
		'Extension or MIME type',
		'Extensión o tipo MIME',
		'text',
		'application/json',
	],
	'url-parser': [
		'URL para analisar',
		'URL to inspect',
		'URL para analizar',
		'text',
		'https://example.com/path?q=1',
		'url',
	],
	'safe-link': ['Link protegido', 'Protected link', 'Enlace protegido', 'text', '', 'url'],
	'cron-parser': ['Expressão cron', 'Cron expression', 'Expresión cron', 'text', '*/15 * * * *'],
	'ddl-csharp': ['CREATE TABLE PostgreSQL', 'PostgreSQL CREATE TABLE', 'CREATE TABLE PostgreSQL'],
	'sql-schema-diff': [
		'Schema PostgreSQL original',
		'Original PostgreSQL schema',
		'Schema PostgreSQL original',
	],
	'json-patch': ['Documento JSON original', 'Original JSON document', 'Documento JSON original'],
	'env-diff': ['Arquivo .env original', 'Original .env file', 'Archivo .env original'],
	'openapi-diff': ['OpenAPI original', 'Original OpenAPI', 'OpenAPI original'],
	openapi: [
		'Documento OpenAPI ou Swagger',
		'OpenAPI or Swagger document',
		'Documento OpenAPI o Swagger',
	],
	markdown: ['Conteúdo Markdown', 'Markdown content', 'Contenido Markdown'],
	'html-editor': ['Código HTML', 'HTML code', 'Código HTML'],
	qr: ['Texto ou URL do QR Code', 'QR Code text or URL', 'Texto o URL del QR'],
};

type Conditions = Readonly<Record<string, ToolControl['when']>>;
const mode = (values: readonly string[]): ToolControl['when'] => ({ key: 'mode', values });
const conditions: Readonly<Record<string, Conditions>> = {
	cpf: { input: mode(['validate']), count: mode(['generate']), format: mode(['generate']) },
	cnpj: {
		input: mode(['validate']),
		count: mode(['generate']),
		format: mode(['generate']),
		alpha: mode(['generate']),
	},
	pix: {
		input: mode(['decode']),
		key: mode(['generate']),
		name: mode(['generate']),
		city: mode(['generate']),
		amount: mode(['generate']),
		txid: mode(['generate']),
	},
	renavam: { input: mode(['validate']) },
	plate: { input: mode(['validate']) },
	'credit-card': { input: mode(['validate']) },
	otp: { code: mode(['verify']) },
	bcrypt: { hash: mode(['verify']), cost: mode(['hash']) },
	bip39: {
		words: mode(['generate']),
		mnemonic: mode(['validate']),
		passphrase: mode(['generate']),
	},
	'pdf-pages': {
		pages: mode(['extract', 'split', 'reorder', 'delete', 'rotate']),
		rotation: mode(['rotate']),
	},
	'connection-string': Object.fromEntries(
		['host', 'port', 'user', 'password', 'tls'].map((key) => [
			key,
			{ key: 'provider', values: ['sqlserver', 'postgresql', 'mysql'] },
		]),
	),
	'webhook-signature': { timestamp: { key: 'provider', values: ['stripe'] } },
	'image-compressor': { quality: { key: 'format', values: ['image/webp', 'image/jpeg'] } },
	'image-converter': { quality: { key: 'format', values: ['image/webp', 'image/jpeg'] } },
};

export function visibleControl(control: ToolControl, values: ToolValues): boolean {
	return !control.when || control.when.values.includes(values[control.when.key] ?? '');
}

export function presentDefinition(definition: ToolDefinition, info: ToolInfo): ToolDefinition {
	const source = inputs[definition.id];
	const controls = definition.controls.map((control): ToolControl => {
		const description = control.key === 'input' ? source : undefined;
		const decimal =
			['temperature', 'percentage', 'rule-of-three', 'clamp'].includes(definition.id) &&
			control.type === 'number' &&
			!['minWidth', 'maxWidth'].includes(control.key);
		const second =
			control.key === 'second' && definition.id !== 'text-diff' && definition.id !== 'json-diff';
		return {
			...control,
			...(description
				? {
						label:
							control.label.pt === 'Entrada'
								? text(description[0], description[1], description[2])
								: control.label,
						type: description[3] ?? control.type,
						placeholder: description[4]
							? text(description[4], description[4], description[4])
							: undefined,
						inputMode: description[5],
					}
				: {}),
			...(second
				? {
						label: text('Versão modificada', 'Modified version', 'Versión modificada'),
						...(definition.id === 'semver' ? { type: 'text' } : {}),
					}
				: {}),
			...(decimal ? { step: 'any', inputMode: 'decimal' } : {}),
			...(control.key === 'port' ||
			control.key === 'ddd' ||
			(control.key === 'code' && definition.id === 'otp')
				? { inputMode: 'numeric' }
				: {}),
			when: control.when ?? conditions[definition.id]?.[control.key],
		};
	});
	// Mode belongs before its dependent fields; stable sort preserves the incumbent order otherwise.
	const ordered = [...controls].sort((a, b) => Number(b.key === 'mode') - Number(a.key === 'mode'));
	const originalAction = definition.action;
	const action = ['Executar', 'Transformar', 'Gerar resultado'].includes(originalAction.pt)
		? info.category === 'generators' ||
			info.category === 'brazilian' ||
			info.category === 'mercosur'
			? text('Gerar dados', 'Generate data', 'Generar datos')
			: /validator|schema$/.test(definition.id)
				? text('Validar entrada', 'Validate input', 'Validar entrada')
				: /formatter|graphql/.test(definition.id)
					? text('Formatar código', 'Format code', 'Formatear código')
					: info.category === 'frontend'
						? text('Atualizar prévia', 'Update preview', 'Actualizar vista previa')
						: /diff|patch|semver/.test(definition.id)
							? text('Comparar versões', 'Compare versions', 'Comparar versiones')
							: /generator|seed|keypair|^csp$|^meta-tags$|^curl$|^api-proxy$|^dotnet-appsettings$|^gitignore$/.test(
										definition.id,
								  )
								? text('Gerar resultado', 'Generate result', 'Generar resultado')
								: info.category === 'security'
									? text('Analisar entrada', 'Inspect input', 'Analizar entrada')
									: text('Converter entrada', 'Convert input', 'Convertir entrada')
		: originalAction;
	return {
		...definition,
		controls: ordered,
		execution: definition.execution ?? (automatic.has(definition.id) ? 'automatic' : 'manual'),
		action: actions[definition.id] ? text(...actions[definition.id]) : action,
	};
}
