import { text } from '@app/core/models/tool';
import type { ToolRegistration } from '@app/features/tools/catalog/tool-registration';

export const SECURITY_TOOLS: readonly ToolRegistration[] = [
	{
		id: 'jwt',
		name: text('JWT Decoder', 'JWT Decoder', undefined, 'tools.jwt'),
		description: text(
			'Inspecione o header e os claims de um token.',
			'Inspect token headers and claims.',
			undefined,
			'tools.jwt',
		),
		category: 'security',
		icon: 'scan',
		keywords: 'jwt token json web header claims auth',
		available: true,
		popular: true,
		loadDefinition: () => import('../security/jwt.tool').then((module) => module.definition),
	},
	{
		id: 'sha',
		name: text('Gerador de hash SHA', 'SHA Hash Generator', undefined, 'tools.sha'),
		description: text(
			'Calcule hashes SHA-256 e SHA-512 localmente.',
			'Calculate SHA-256 and SHA-512 hashes locally.',
			undefined,
			'tools.sha',
		),
		category: 'security',
		icon: 'shield',
		keywords: 'hash digest checksum sha256 sha512',
		available: true,
		loadDefinition: () => import('../security/sha.tool').then((module) => module.definition),
	},
	{
		id: 'hmac',
		category: 'security',
		name: text('HMAC Generator', 'HMAC Generator', undefined, 'tools.hmac'),
		description: text(
			'Calcule HMAC SHA-256 ou SHA-512 com um segredo.',
			'Compute HMAC SHA-256 or SHA-512 with a secret.',
			'Calcula HMAC SHA-256 o SHA-512 con un secreto.',
			'tools.hmac',
		),
		icon: 'shield',
		keywords: '',
		available: true,

		loadDefinition: () => import('../security/hmac.tool').then((module) => module.definition),
	},
	{
		id: 'aes',
		category: 'security',
		name: text('AES Encrypt/Decrypt', 'AES Encrypt/Decrypt', undefined, 'tools.aes'),
		description: text(
			'Criptografe ou descriptografe texto com AES-256-GCM e senha.',
			'Encrypt or decrypt text with AES-256-GCM and a password.',
			'Cifra o descifra texto con AES-256-GCM y una contraseña.',
			'tools.aes',
		),
		icon: 'shield',
		keywords: '',
		available: true,

		loadDefinition: () => import('../security/aes.tool').then((module) => module.definition),
	},
	{
		id: 'jwt-claims',
		category: 'security',
		name: text('JWT Claims Analyzer', 'JWT Claims Analyzer', undefined, 'tools.jwt-claims'),
		description: text(
			'Analise claims, expiração, emissor e audiência de um JWT.',
			'Inspect JWT claims, expiry, issuer and audience.',
			'Analiza claims, caducidad, emisor y audiencia de un JWT.',
			'tools.jwt-claims',
		),
		icon: 'shield',
		keywords: '',
		available: true,

		loadDefinition: () => import('../security/jwt-claims.tool').then((module) => module.definition),
	},
	{
		id: 'pem',
		category: 'security',
		name: text('PEM Decoder', 'PEM Decoder', undefined, 'tools.pem'),
		description: text(
			'Inspecione blocos PEM e seus dados codificados.',
			'Inspect PEM blocks and their encoded data.',
			'Inspecciona bloques PEM y sus datos codificados.',
			'tools.pem',
		),
		icon: 'shield',
		keywords: '',
		available: true,

		loadDefinition: () => import('../security/pem.tool').then((module) => module.definition),
	},
	{
		id: 'pem-jwk',
		category: 'security',
		name: text('PEM para JWK', 'PEM to JWK', undefined, 'tools.pem-jwk'),
		description: text(
			'Converta certificado ou chave PEM em uma chave JWK.',
			'Convert a PEM certificate or key to JWK.',
			'Convierte un certificado o clave PEM a JWK.',
			'tools.pem-jwk',
		),
		icon: 'shield',
		keywords: '',
		available: true,

		loadDefinition: () => import('../security/pem-jwk.tool').then((module) => module.definition),
	},
	{
		id: 'asn1',
		category: 'security',
		name: text('ASN.1 Decoder', 'ASN.1 Decoder', undefined, 'tools.asn1'),
		description: text(
			'Explore a estrutura ASN.1 de dados DER em Base64.',
			'Explore the ASN.1 structure of Base64 DER data.',
			'Explora la estructura ASN.1 de datos DER en Base64.',
			'tools.asn1',
		),
		icon: 'shield',
		keywords: '',
		available: true,

		loadDefinition: () => import('../security/asn1.tool').then((module) => module.definition),
	},
	{
		id: 'x509',
		category: 'security',
		name: text('X.509 Certificate Viewer', 'X.509 Certificate Viewer', undefined, 'tools.x509'),
		description: text(
			'Leia emissor, validade e extensões de um certificado X.509.',
			"Read an X.509 certificate's issuer, validity and extensions.",
			'Lee el emisor, la validez y las extensiones de un certificado X.509.',
			'tools.x509',
		),
		icon: 'shield',
		keywords: '',
		available: true,

		loadDefinition: () => import('../security/x509.tool').then((module) => module.definition),
	},
	{
		id: 'csr',
		category: 'security',
		name: text('CSR Decoder', 'CSR Decoder', undefined, 'tools.csr'),
		description: text(
			'Inspecione uma solicitação CSR e confira sua assinatura.',
			'Inspect a CSR request and check its signature.',
			'Inspecciona una solicitud CSR y comprueba su firma.',
			'tools.csr',
		),
		icon: 'shield',
		keywords: '',
		available: true,

		loadDefinition: () => import('../security/csr.tool').then((module) => module.definition),
	},
	{
		id: 'certificate-chain',
		category: 'security',
		name: text(
			'Certificate Chain Inspector',
			'Certificate Chain Inspector',
			undefined,
			'tools.certificate-chain',
		),
		description: text(
			'Confira assinaturas entre os certificados de uma cadeia fornecida.',
			'Check signatures between certificates in a supplied chain.',
			'Comprueba firmas entre certificados de una cadena proporcionada.',
			'tools.certificate-chain',
		),
		icon: 'shield',
		keywords: '',
		available: true,

		loadDefinition: () =>
			import('../security/certificate-chain.tool').then((module) => module.definition),
	},
	{
		id: 'file-hash',
		category: 'security',
		name: text('File Hash Calculator', 'File Hash Calculator', undefined, 'tools.file-hash'),
		description: text(
			'Calcule o hash de um arquivo sem enviá-lo.',
			'Compute a file hash without uploading the file.',
			'Calcula el hash de un archivo sin enviarlo.',
			'tools.file-hash',
		),
		icon: 'shield',
		keywords: '',
		available: true,

		loadDefinition: () => import('../security/file-hash.tool').then((module) => module.definition),
	},
	{
		id: 'csp',
		category: 'security',
		name: text('CSP Generator', 'CSP Generator', undefined, 'tools.csp'),
		description: text(
			'Monte uma política CSP a partir das origens permitidas.',
			'Build a CSP policy from allowed resource origins.',
			'Crea una política CSP con los orígenes permitidos.',
			'tools.csp',
		),
		icon: 'shield',
		keywords: '',
		available: true,

		loadDefinition: () => import('../security/csp.tool').then((module) => module.definition),
	},
	{
		id: 'sri',
		category: 'security',
		name: text('SRI Hash Generator', 'SRI Hash Generator', undefined, 'tools.sri'),
		description: text(
			'Gere um atributo integrity a partir do hash de um arquivo.',
			'Generate an integrity attribute from a file hash.',
			'Genera un atributo integrity a partir del hash de un archivo.',
			'tools.sri',
		),
		icon: 'shield',
		keywords: '',
		available: true,

		loadDefinition: () => import('../security/sri.tool').then((module) => module.definition),
	},
	{
		id: 'webhook-signature',
		category: 'security',
		name: text(
			'Webhook Signature Generator',
			'Webhook Signature Generator',
			undefined,
			'tools.webhook-signature',
		),
		description: text(
			'Gere assinaturas HMAC nos formatos GitHub, Stripe ou genérico.',
			'Generate webhook HMAC signatures for GitHub, Stripe or a generic format.',
			'Genera firmas HMAC de webhooks para GitHub, Stripe o un formato genérico.',
			'tools.webhook-signature',
		),
		icon: 'shield',
		keywords: '',
		available: true,

		loadDefinition: () =>
			import('../security/webhook-signature.tool').then((module) => module.definition),
	},
	{
		id: 'p12-explorer',
		category: 'security',
		name: text(
			'Explorador de PKCS#12/P12',
			'PKCS#12/P12 Explorer',
			undefined,
			'tools.p12-explorer',
		),
		description: text(
			'Abra um arquivo P12 com senha e inspecione seus certificados.',
			'Open a password-protected P12 file and inspect its certificates.',
			'Abre un archivo P12 con contraseña e inspecciona sus certificados.',
			'tools.p12-explorer',
		),
		icon: 'shield',
		keywords: '',
		available: true,

		loadDefinition: () =>
			import('../security/p12-explorer.tool').then((module) => module.definition),
	},
	{
		id: 'p7b-bundle',
		category: 'security',
		name: text(
			'Criador de pacote P7B',
			'P7B Certificate Bundle Builder',
			undefined,
			'tools.p7b-bundle',
		),
		description: text(
			'Empacote certificados PEM em um arquivo P7B sem assinatura.',
			'Bundle PEM certificates into an unsigned P7B file.',
			'Agrupa certificados PEM en un archivo P7B sin firma.',
			'tools.p7b-bundle',
		),
		icon: 'shield',
		keywords: '',
		available: true,

		loadDefinition: () => import('../security/p7b-bundle.tool').then((module) => module.definition),
	},
	{
		id: 'p7b-explorer',
		category: 'security',
		name: text(
			'Explorador de pacote P7B',
			'P7B Certificate Bundle Explorer',
			undefined,
			'tools.p7b-explorer',
		),
		description: text(
			'Liste os certificados presentes em um pacote P7B.',
			'List the certificates contained in a P7B bundle.',
			'Lista los certificados de un paquete P7B.',
			'tools.p7b-explorer',
		),
		icon: 'shield',
		keywords: '',
		available: true,

		loadDefinition: () =>
			import('../security/p7b-explorer.tool').then((module) => module.definition),
	},
	{
		id: 'crl-explorer',
		category: 'security',
		name: text('Explorador de CRL', 'CRL Explorer', undefined, 'tools.crl-explorer'),
		description: text(
			'Leia a estrutura e as entradas de uma lista de revogação.',
			"Read a certificate revocation list's structure and entries.",
			'Lee la estructura y las entradas de una lista de revocación.',
			'tools.crl-explorer',
		),
		icon: 'shield',
		keywords: '',
		available: true,

		loadDefinition: () =>
			import('../security/crl-explorer.tool').then((module) => module.definition),
	},
	{
		id: 'timestamp-request',
		category: 'security',
		name: text(
			'Gerador de solicitação de carimbo de tempo',
			'Timestamp Request Generator',
			undefined,
			'tools.timestamp-request',
		),
		description: text(
			'Crie uma solicitação RFC 3161 para enviar a uma TSA.',
			'Create an RFC 3161 request to send to a TSA.',
			'Crea una solicitud RFC 3161 para enviar a una TSA.',
			'tools.timestamp-request',
		),
		icon: 'shield',
		keywords: '',
		available: true,

		loadDefinition: () =>
			import('../security/timestamp-request.tool').then((module) => module.definition),
	},
	{
		id: 'tsr-decoder',
		category: 'security',
		name: text(
			'Decodificador de resposta TSR',
			'TSR Response Decoder',
			undefined,
			'tools.tsr-decoder',
		),
		description: text(
			'Inspecione o status e a estrutura de uma resposta TSR.',
			'Inspect the status and structure of a TSR response.',
			'Inspecciona el estado y la estructura de una respuesta TSR.',
			'tools.tsr-decoder',
		),
		icon: 'shield',
		keywords: '',
		available: true,

		loadDefinition: () =>
			import('../security/tsr-decoder.tool').then((module) => module.definition),
	},
];
