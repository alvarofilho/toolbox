import 'reflect-metadata';
import { X509Certificate, Pkcs10CertificateRequest } from '@peculiar/x509';
import { fromBER } from 'asn1js';
import * as asn1js from 'asn1js';
import {
	AlgorithmIdentifier,
	Certificate,
	CertificateRevocationList,
	ContentInfo,
	EncapsulatedContentInfo,
	MessageImprint,
	PFX,
	SignedData,
	TimeStampReq,
	TimeStampResp,
} from 'pkijs';
import { importPKCS8, importSPKI, exportJWK } from 'jose';
import { decodeJwt } from '@app/shared/utils/encoding';
import {
	tool,
	source,
	input,
	select,
	mode,
	file,
	field,
	result,
	json,
	object,
	utf8,
	bytesHex,
	bytesBase64,
	base64Bytes,
	firstFile,
	text,
} from '@app/features/tools/extended/common';

const algorithm = select('algorithm', 'Algoritmo', 'Algorithm', [
	['SHA-256', 'SHA-256', 'SHA-256'],
	['SHA-512', 'SHA-512', 'SHA-512'],
]);
const secret = input('secret', 'Segredo (texto UTF-8)', 'Secret (UTF-8 text)', '', 'text');
const decodeHint = text(
	'Decodificação e inspeção local. Confiança, revogação e autenticidade não são confirmadas automaticamente.',
	'Local decoding and inspection. Trust, revocation and authenticity are not automatically established.',
);
export async function hmac(message: string, key: string, hash = 'SHA-256'): Promise<string> {
	if (!key) {
		throw new Error('Informe o segredo / Enter a secret');
	}
	const imported = await crypto.subtle.importKey('raw', utf8(key), { name: 'HMAC', hash }, false, [
		'sign',
	]);
	return bytesHex(new Uint8Array(await crypto.subtle.sign('HMAC', imported, utf8(message))));
}

function pemBlocks(value: string): { label: string; bytes: Uint8Array<ArrayBuffer> }[] {
	const matches = [
		...value.matchAll(/-----BEGIN ([A-Z0-9 ]+)-----\s*([A-Za-z0-9+/=\s]+?)\s*-----END \1-----/g),
	];
	if (!matches.length || matches.length > 30) {
		throw new Error('Use 1–30 blocos PEM / Use 1–30 PEM blocks');
	}
	return matches.map((m) => ({ label: m[1], bytes: base64Bytes(m[2].replace(/\s/g, '')) }));
}

const certInfo = (cert: X509Certificate) => ({
	subject: cert.subject,
	issuer: cert.issuer,
	serial: cert.serialNumber,
	notBefore: cert.notBefore,
	notAfter: cert.notAfter,
	validNow: Date.now() >= cert.notBefore.getTime() && Date.now() <= cert.notAfter.getTime(),
	signatureAlgorithm: cert.signatureAlgorithm,
	publicKeyAlgorithm: cert.publicKey.algorithm,
	extensions: cert.extensions.map((e) => ({
		type: e.type,
		critical: e.critical,
		text: e.toString(),
	})),
});
export const definitions = [
	tool(
		'p12-explorer',
		[file(), input('password', 'Senha do arquivo P12', 'P12 file password', '', 'password')],
		async (v, files) => {
			const selected = firstFile(files);
			if (selected.size > 20_000_000) {
				throw new Error('Limite: 20 MB / Limit: 20 MB');
			}
			const bytes = new Uint8Array(await selected.arrayBuffer());
			const parsed = fromBER(bytes.buffer);
			if (parsed.offset === -1 || parsed.offset !== bytes.length) {
				throw new Error('Arquivo PKCS#12 inválido / Invalid PKCS#12 file');
			}
			const pfx = new PFX({ schema: parsed.result });
			await pfx.parseInternalValues({
				password: utf8(field(v, 'password')).buffer,
				checkIntegrity: true,
			});
			return result({
				filename: selected.name,
				version: pfx.version,
				authSafeContentType: pfx.authSafe.contentType,
				hasMac: !!pfx.macData,
				integrityVerified: !!pfx.macData,
				authenticatedSafeParsed: !!pfx.parsedValue?.authenticatedSafe,
			});
		},
		undefined,
		text(
			'A senha é usada localmente para abrir e conferir a integridade. Chaves privadas não são exibidas nem enviadas.',
			'The password is used locally to open the file and check integrity. Private keys are not displayed or uploaded.',
		),
	),
	tool(
		'p7b-bundle',
		[source],
		(v) => {
			const blocks = pemBlocks(field(v, 'input')).filter(({ label }) => label === 'CERTIFICATE');
			if (!blocks.length || blocks.length > 50) {
				throw new Error('Informe de 1 a 50 certificados PEM / Provide 1 to 50 PEM certificates');
			}
			const certificates = blocks.map(({ bytes }) => {
				const parsed = fromBER(bytes.buffer);
				if (parsed.offset === -1 || parsed.offset !== bytes.length) {
					throw new Error('Certificado PEM inválido / Invalid PEM certificate');
				}
				return new Certificate({ schema: parsed.result });
			});
			const signedData = new SignedData({
				version: 1,
				digestAlgorithms: [],
				encapContentInfo: new EncapsulatedContentInfo({ eContentType: ContentInfo.DATA }),
				certificates,
				signerInfos: [],
			});
			const contentInfo = new ContentInfo({
				contentType: ContentInfo.SIGNED_DATA,
				content: signedData.toSchema(),
			});
			const der = new Uint8Array(contentInfo.toSchema().toBER(false));
			const encoded =
				bytesBase64(der)
					.match(/.{1,64}/g)
					?.join('\n') ?? '';
			return result(`-----BEGIN PKCS7-----\n${encoded}\n-----END PKCS7-----`, 'certificates.p7b');
		},
		undefined,
		text(
			'Cria um pacote SignedData sem assinatura, contendo os certificados fornecidos. Não cria uma assinatura digital.',
			'Creates an unsigned SignedData bundle containing the supplied certificates. It does not create a digital signature.',
		),
	),
	tool(
		'p7b-explorer',
		[source],
		(v) => {
			const value = field(v, 'input').trim();
			const base64Value = value.replace(/-----BEGIN PKCS7-----|-----END PKCS7-----|\s/g, '');
			const bytes = base64Bytes(base64Value);
			const parsed = fromBER(bytes.buffer);
			if (parsed.offset === -1 || parsed.offset !== bytes.length) {
				throw new Error('Pacote PKCS#7 inválido / Invalid PKCS#7 bundle');
			}
			const contentInfo = new ContentInfo({ schema: parsed.result });
			if (contentInfo.contentType !== ContentInfo.SIGNED_DATA) {
				throw new Error('Esperado PKCS#7 SignedData / Expected PKCS#7 SignedData');
			}
			const signedData = new SignedData({ schema: contentInfo.content });
			return result({
				contentType: contentInfo.contentType,
				certificateCount: signedData.certificates?.length ?? 0,
				signerCount: signedData.signerInfos.length,
				signed: signedData.signerInfos.length > 0,
				certificates: signedData.certificates?.map((certificate) => certificate.toJSON()) ?? [],
			});
		},
		undefined,
		decodeHint,
	),
	tool(
		'crl-explorer',
		[source],
		(v) => {
			const value = field(v, 'input').trim();
			const bytes = value.startsWith('-----') ? pemBlocks(value)[0].bytes : base64Bytes(value);
			const parsed = fromBER(bytes.buffer);
			if (parsed.offset === -1 || parsed.offset !== bytes.length) {
				throw new Error('CRL ASN.1 inválida / Invalid CRL ASN.1');
			}
			const crl = new CertificateRevocationList({ schema: parsed.result });
			return result({
				issuer: crl.issuer.toJSON(),
				thisUpdate: crl.thisUpdate.toJSON(),
				nextUpdate: crl.nextUpdate?.toJSON() ?? null,
				revokedCertificates: crl.revokedCertificates?.map((entry) => entry.toJSON()) ?? [],
				signatureAlgorithm: crl.signatureAlgorithm.toJSON(),
				signatureVerified: false,
			});
		},
		undefined,
		text(
			'Inspeciona a estrutura da CRL. Não consulta nem confirma o estado de revogação de um certificado.',
			'Inspects the CRL structure. It does not query or confirm a certificate revocation status.',
		),
	),
	tool(
		'timestamp-request',
		[source],
		async (v) => {
			const value = field(v, 'input');
			if (!value) {
				throw new Error('Informe o conteúdo a resumir / Enter content to hash');
			}
			const digest = new Uint8Array(await crypto.subtle.digest('SHA-256', utf8(value)));
			const messageImprint = new MessageImprint({
				hashAlgorithm: new AlgorithmIdentifier({
					algorithmId: '2.16.840.1.101.3.4.2.1',
					algorithmParams: new asn1js.Null(),
				}),
				hashedMessage: new asn1js.OctetString({ valueHex: digest.buffer }),
			});
			const randomNonce = crypto.getRandomValues(new Uint8Array(8));
			const nonceBytes =
				randomNonce[0] !== undefined && randomNonce[0] >= 0x80
					? new Uint8Array([0, ...randomNonce])
					: randomNonce;
			const request = new TimeStampReq({
				version: 1,
				messageImprint,
				nonce: new asn1js.Integer({ valueHex: nonceBytes.buffer }),
				certReq: true,
			});
			const der = new Uint8Array(request.toSchema().toBER(false));
			return result(
				{
					algorithm: 'SHA-256',
					digest: bytesHex(digest),
					requestBase64: bytesBase64(der),
					requestPem: `-----BEGIN TSQ-----\n${
						bytesBase64(der)
							.match(/.{1,64}/g)
							?.join('\n') ?? ''
					}\n-----END TSQ-----`,
				},
				'timestamp-request.json',
			);
		},
		undefined,
		text(
			'Gera uma solicitação RFC 3161 local. Envie-a ao serviço TSA da sua organização para obter a resposta assinada.',
			'Generates a local RFC 3161 request. Send it to your organization’s TSA to obtain a signed response.',
		),
	),
	tool(
		'tsr-decoder',
		[source],
		(v) => {
			const value = field(v, 'input').trim();
			const base64Value = value.replace(/-----BEGIN TS[PR]-----|-----END TS[PR]-----|\s/g, '');
			const bytes = base64Bytes(base64Value);
			const parsed = fromBER(bytes.buffer);
			if (parsed.offset === -1 || parsed.offset !== bytes.length) {
				throw new Error('Resposta TSR inválida / Invalid TSR response');
			}
			const response = new TimeStampResp({ schema: parsed.result });
			return result({
				status: response.status.status,
				statusInfo: response.status.toJSON(),
				hasTimeStampToken: !!response.timeStampToken,
				tokenContentType: response.timeStampToken?.contentType ?? null,
			});
		},
		undefined,
		text(
			'Mostra o status e a estrutura da resposta. Não valida cadeia de confiança, assinatura ou política da TSA.',
			'Shows the response status and structure. It does not validate TSA trust, signature, or policy.',
		),
	),
	tool(
		'hmac',
		[source, secret, algorithm],
		async (v) =>
			result(await hmac(field(v, 'input'), field(v, 'secret'), field(v, 'algorithm')), 'hmac.txt'),
		{ input: 'message', secret: 'test-secret' },
	),
	tool(
		'aes',
		[source, secret, mode(['encrypt', 'decrypt'])],
		async (v) => {
			const password = field(v, 'secret');
			if (password.length < 12) {
				throw new Error(
					'Use uma senha de pelo menos 12 caracteres / Use a password with at least 12 characters',
				);
			}
			const base = await crypto.subtle.importKey('raw', utf8(password), 'PBKDF2', false, [
				'deriveKey',
			]);
			if (field(v, 'mode') === 'encrypt') {
				const salt = crypto.getRandomValues(new Uint8Array(16)),
					iv = crypto.getRandomValues(new Uint8Array(12));
				const key = await crypto.subtle.deriveKey(
					{ name: 'PBKDF2', salt, iterations: 310000, hash: 'SHA-256' },
					base,
					{ name: 'AES-GCM', length: 256 },
					false,
					['encrypt'],
				);
				const encrypted = await crypto.subtle.encrypt(
					{ name: 'AES-GCM', iv },
					key,
					utf8(field(v, 'input')),
				);
				return result(
					{
						version: 1,
						algorithm: 'AES-256-GCM',
						kdf: 'PBKDF2-SHA256',
						iterations: 310000,
						salt: bytesBase64(salt),
						iv: bytesBase64(iv),
						ciphertext: bytesBase64(new Uint8Array(encrypted)),
					},
					'encrypted.json',
				);
			}
			const data = object(json(field(v, 'input')));
			if (
				data['version'] !== 1 ||
				data['algorithm'] !== 'AES-256-GCM' ||
				data['kdf'] !== 'PBKDF2-SHA256' ||
				data['iterations'] !== 310000 ||
				typeof data['salt'] !== 'string' ||
				typeof data['iv'] !== 'string' ||
				typeof data['ciphertext'] !== 'string'
			) {
				throw new Error('Envelope AES inválido / Invalid AES envelope');
			}
			const salt = base64Bytes(data['salt']),
				iv = base64Bytes(data['iv']);
			if (salt.length !== 16 || iv.length !== 12) {
				throw new Error('Salt/IV inválido / Invalid salt/IV');
			}
			const key = await crypto.subtle.deriveKey(
				{ name: 'PBKDF2', salt, iterations: 310000, hash: 'SHA-256' },
				base,
				{ name: 'AES-GCM', length: 256 },
				false,
				['decrypt'],
			);
			try {
				return result(
					new TextDecoder('utf-8', { fatal: true }).decode(
						await crypto.subtle.decrypt(
							{ name: 'AES-GCM', iv },
							key,
							base64Bytes(data['ciphertext']),
						),
					),
					'decrypted.txt',
				);
			} catch {
				throw new Error(
					'Senha incorreta ou conteúdo adulterado / Incorrect password or modified ciphertext',
				);
			}
		},
		{ input: 'Mensagem para teste', secret: 'uma-senha-de-teste' },
		text(
			'AES-256-GCM autenticado com salt e IV aleatórios; PBKDF2-SHA256 (310.000 iterações). Guarde a senha separadamente.',
			'Authenticated AES-256-GCM with random salt and IV; PBKDF2-SHA256 (310,000 iterations). Keep the password separately.',
		),
	),
	tool(
		'jwt-claims',
		[
			source,
			input('issuer', 'Issuer esperado (opcional)', 'Expected issuer (optional)', '', 'text'),
			input('audience', 'Audience esperada (opcional)', 'Expected audience (optional)', '', 'text'),
		],
		(v) => {
			const decoded = object(json(decodeJwt(field(v, 'input')))),
				payload = object(decoded['payload']);
			const now = Math.floor(Date.now() / 1000),
				exp = payload['exp'],
				nbf = payload['nbf'];
			const expectedIssuer = field(v, 'issuer'),
				expectedAudience = field(v, 'audience'),
				aud = payload['aud'];
			return result({
				...decoded,
				analysis: {
					expired: typeof exp === 'number' ? now >= exp : null,
					notYetValid: typeof nbf === 'number' ? now < nbf : null,
					issuerMatches: expectedIssuer ? payload['iss'] === expectedIssuer : null,
					audienceMatches: expectedAudience
						? Array.isArray(aud)
							? aud.includes(expectedAudience)
							: aud === expectedAudience
						: null,
					numericDateTypeErrors: ['exp', 'iat', 'nbf'].filter(
						(k) => payload[k] !== undefined && typeof payload[k] !== 'number',
					),
					signatureVerified: false,
				},
			});
		},
		undefined,
		decodeHint,
	),
	tool(
		'pem',
		[source],
		(v) =>
			result(
				pemBlocks(field(v, 'input')).map(({ label, bytes }) => ({
					label,
					byteLength: bytes.length,
					hex: bytesHex(bytes),
				})),
			),
		undefined,
		decodeHint,
	),
	tool(
		'pem-jwk',
		[
			source,
			select('algorithm', 'Algoritmo JOSE', 'JOSE algorithm', [
				['RS256', 'RS256', 'RS256'],
				['PS256', 'PS256', 'PS256'],
				['ES256', 'ES256', 'ES256'],
				['ES384', 'ES384', 'ES384'],
				['EdDSA', 'EdDSA', 'EdDSA'],
			]),
		],
		async (v) => {
			const pem = field(v, 'input'),
				alg = field(v, 'algorithm');
			if (pem.includes('BEGIN CERTIFICATE')) {
				return result(
					await crypto.subtle.exportKey('jwk', await new X509Certificate(pem).publicKey.export()),
				);
			}
			if (pem.includes('BEGIN PUBLIC KEY')) {
				return result(await exportJWK(await importSPKI(pem, alg, { extractable: true })));
			}
			if (pem.includes('BEGIN PRIVATE KEY')) {
				return result(await exportJWK(await importPKCS8(pem, alg, { extractable: true })));
			}
			throw new Error(
				'Use CERTIFICATE, PUBLIC KEY (SPKI) ou PRIVATE KEY (PKCS#8) / Unsupported PEM type',
			);
		},
		undefined,
		text(
			'Chaves privadas exportadas contêm material secreto. O processamento fica no navegador.',
			'Exported private keys contain secret material. Processing stays in the browser.',
		),
	),
	tool(
		'asn1',
		[source],
		(v) => {
			const value = field(v, 'input').trim();
			const bytes = value.startsWith('-----')
				? pemBlocks(value)[0].bytes
				: base64Bytes(value.replace(/\s/g, ''));
			const parsed = fromBER(bytes.buffer, {
				maxDepth: 32,
				maxNodes: 10000,
				maxContentLength: 1000000,
			});
			if (parsed.offset === -1 || parsed.offset !== bytes.length) {
				throw new Error(parsed.result.error || 'ASN.1 inválido / Invalid ASN.1');
			}
			return result(parsed.result.toJSON());
		},
		{ input: 'MAYCAQECAQI=' },
		decodeHint,
	),
	tool(
		'x509',
		[source],
		async (v) => {
			const cert = new X509Certificate(field(v, 'input'));
			return result({
				...certInfo(cert),
				sha256: bytesHex(new Uint8Array(await cert.getThumbprint('SHA-256'))),
				signatureVerified: false,
			});
		},
		undefined,
		decodeHint,
	),
	tool(
		'csr',
		[source],
		async (v) => {
			const csr = new Pkcs10CertificateRequest(field(v, 'input'));
			return result({
				subject: csr.subject,
				algorithm: csr.signatureAlgorithm,
				extensions: csr.extensions.map((e) => e.toString()),
				signatureVerified: await csr.verify(),
				text: csr.toString('text'),
			});
		},
		undefined,
		decodeHint,
	),
	tool(
		'certificate-chain',
		[source],
		async (v) => {
			const blocks = field(v, 'input').match(
				/-----BEGIN CERTIFICATE-----[\s\S]*?-----END CERTIFICATE-----/g,
			);
			if (!blocks?.length || blocks.length > 20) {
				throw new Error('Use 1–20 certificados PEM / Use 1–20 PEM certificates');
			}
			const certs = blocks.map((pem) => new X509Certificate(pem));
			const certificates = await Promise.all(
				certs.map(async (cert) => {
					const issuer = certs.find((candidate) => candidate.subject === cert.issuer);
					return {
						...certInfo(cert),
						issuerPresent: !!issuer,
						signatureVerified: issuer
							? await cert.verify({ publicKey: issuer.publicKey, signatureOnly: true })
							: false,
					};
				}),
			);
			return result({
				certificates,
				trustEstablished: false,
				revocationChecked: false,
				hostnameChecked: false,
				policyValidation: false,
			});
		},
		undefined,
		text(
			'Verifica assinaturas entre os certificados fornecidos e mostra validade temporal. Não estabelece confiança de uma CA nem consulta revogação.',
			'Verifies signatures between supplied certificates and shows validity dates. Does not establish CA trust or check revocation.',
		),
	),
	tool('file-hash', [file(), algorithm], async (v, files) => {
		const f = firstFile(files);
		return result({
			filename: f.name,
			bytes: f.size,
			algorithm: field(v, 'algorithm'),
			hash: bytesHex(
				new Uint8Array(await crypto.subtle.digest(field(v, 'algorithm'), await f.arrayBuffer())),
			),
		});
	}),
	tool(
		'csp',
		[
			input(
				'script',
				'Origens de scripts (separadas por espaço)',
				'Script sources (space-separated)',
				"'self'",
				'text',
			),
			input('style', 'Origens de estilos', 'Style sources', "'self'", 'text'),
			input('image', 'Origens de imagens', 'Image sources', "'self' data:", 'text'),
			input('connect', 'Origens de conexões', 'Connection sources', "'self'", 'text'),
		],
		(v) => {
			const clean = (s: string) => {
				if (/[;\r\n]/.test(s)) {
					throw new Error('Origens inválidas / Invalid sources');
				}
				return s.trim() || "'none'";
			};
			return result(
				`default-src 'none'; script-src ${clean(field(v, 'script'))}; style-src ${clean(field(v, 'style'))}; img-src ${clean(field(v, 'image'))}; connect-src ${clean(field(v, 'connect'))}; font-src 'self'; base-uri 'none'; object-src 'none'; frame-ancestors 'none'; form-action 'self'`,
				'csp.txt',
			);
		},
	),
	tool(
		'sri',
		[
			file(),
			select('algorithm', 'Algoritmo', 'Algorithm', [
				['SHA-256', 'SHA-256', 'SHA-256'],
				['SHA-384', 'SHA-384', 'SHA-384'],
				['SHA-512', 'SHA-512', 'SHA-512'],
			]),
		],
		async (v, files) => {
			const f = firstFile(files),
				alg = field(v, 'algorithm');
			return result(
				`${alg.toLowerCase().replace('-', '')}-${bytesBase64(new Uint8Array(await crypto.subtle.digest(alg, await f.arrayBuffer())))}`,
				'integrity.txt',
			);
		},
	),
	tool(
		'webhook-signature',
		[
			source,
			secret,
			select('provider', 'Formato', 'Format', [
				['github', 'GitHub SHA-256', 'GitHub SHA-256'],
				['stripe', 'Stripe v1', 'Stripe v1'],
				['raw', 'HMAC SHA-256', 'HMAC SHA-256'],
			]),
			input(
				'timestamp',
				'Timestamp Unix (Stripe)',
				'Unix timestamp (Stripe)',
				'1767225600',
				'text',
			),
		],
		async (v) => {
			const provider = field(v, 'provider'),
				stamp = field(v, 'timestamp');
			if (provider === 'stripe' && !/^\d{1,12}$/.test(stamp)) {
				throw new Error('Timestamp inválido / Invalid timestamp');
			}
			const signature = await hmac(
				provider === 'stripe' ? `${stamp}.${field(v, 'input')}` : field(v, 'input'),
				field(v, 'secret'),
			);
			return result(
				provider === 'github'
					? `sha256=${signature}`
					: provider === 'stripe'
						? `t=${stamp},v1=${signature}`
						: signature,
				'signature.txt',
			);
		},
		{ input: '{"event":"test"}', secret: 'test-secret' },
	),
];
