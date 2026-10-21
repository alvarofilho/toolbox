import { compactVerify, importJWK, importSPKI } from 'jose';

import { TranslatedToolError, type TranslationKey } from '@app/core/models/tool';
import { decodeJwt } from '@app/features/tools/_shared/encoding';

type JwtHeader = Readonly<Record<string, unknown>>;
type JwtPayload = Readonly<Record<string, unknown>>;
type SupportedAlgorithm = 'RS256' | 'ES256';
type JsonWebKey = Readonly<Record<string, unknown>> & { readonly kty: string };

interface DecodedJwt {
	readonly header: JwtHeader;
	readonly payload: JwtPayload;
}

interface ClaimChecks {
	readonly issuer?: string;
	readonly audience?: string;
}

const supportedAlgorithms = new Set<SupportedAlgorithm>(['RS256', 'ES256']);

function fail(key: TranslationKey): never {
	throw new TranslatedToolError(key, {}, 'key');
}

function isRecord(value: unknown): value is Record<string, unknown> {
	return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function decode(value: string): DecodedJwt {
	const decoded: unknown = JSON.parse(decodeJwt(value));
	if (!isRecord(decoded) || !isRecord(decoded['header']) || !isRecord(decoded['payload'])) {
		throw new TranslatedToolError('tools.jwt.invalid_json_segment', {}, 'input');
	}
	return { header: decoded['header'], payload: decoded['payload'] };
}

function parseKeySet(source: string): readonly JsonWebKey[] | string {
	const trimmed = source.trim();
	if (!trimmed) {
		fail('tools.jwt.verification_key_required');
	}
	if (trimmed.startsWith('-----BEGIN PUBLIC KEY-----')) {
		return trimmed;
	}
	try {
		const parsed: unknown = JSON.parse(trimmed);
		if (!isRecord(parsed)) {
			fail('tools.jwt.invalid_key_format');
		}
		const keys = parsed['keys'];
		const candidates = Array.isArray(keys) ? keys : [parsed];
		if (
			!candidates.length ||
			!candidates.every((key) => isRecord(key) && typeof key['kty'] === 'string')
		) {
			fail('tools.jwt.invalid_key_format');
		}
		return candidates as JsonWebKey[];
	} catch (error) {
		if (error instanceof TranslatedToolError) {
			throw error;
		}
		fail('tools.jwt.invalid_key_format');
	}
}

function selectJwk(
	keys: readonly JsonWebKey[],
	header: JwtHeader,
	algorithm: SupportedAlgorithm,
): JsonWebKey {
	const kid = header['kid'];
	const matchingId = typeof kid === 'string' ? keys.filter((key) => key['kid'] === kid) : keys;
	if (matchingId.length === 0 && typeof kid === 'string') {
		fail('tools.jwt.key_id_not_found');
	}
	const compatible = matchingId.filter((key) => {
		const expectedType = algorithm === 'RS256' ? 'RSA' : 'EC';
		return (
			key['kty'] === expectedType &&
			(key['alg'] === undefined || key['alg'] === algorithm) &&
			(key['use'] === undefined || key['use'] === 'sig') &&
			(!Array.isArray(key['key_ops']) || key['key_ops'].includes('verify'))
		);
	});
	if (compatible.length === 0) {
		fail('tools.jwt.no_compatible_key');
	}
	if (compatible.length > 1) {
		fail('tools.jwt.ambiguous_key_id');
	}
	const key = compatible[0];
	if (
		!key ||
		'd' in key ||
		'p' in key ||
		'q' in key ||
		'dp' in key ||
		'dq' in key ||
		'qi' in key ||
		'k' in key
	) {
		fail('tools.jwt.public_key_required');
	}
	return key;
}

async function verifySignature(token: string, header: JwtHeader, source: string): Promise<boolean> {
	const alg = header['alg'];
	if (
		alg === 'none' ||
		typeof alg !== 'string' ||
		!supportedAlgorithms.has(alg as SupportedAlgorithm)
	) {
		fail('tools.jwt.unsupported_algorithm');
	}
	const algorithm = alg as SupportedAlgorithm;
	const sourceKey = parseKeySet(source);
	try {
		const key =
			typeof sourceKey === 'string'
				? await importSPKI(sourceKey, algorithm)
				: await importJWK(selectJwk(sourceKey, header, algorithm), algorithm);
		await compactVerify(token, key, { algorithms: [algorithm] });
		return true;
	} catch (error) {
		if (error instanceof TranslatedToolError) {
			throw error;
		}
		if (error instanceof Error && /signature/i.test(error.message)) {
			return false;
		}
		fail('tools.jwt.invalid_key_format');
	}
}

function evaluateClaims(
	payload: JwtPayload,
	checks: ClaimChecks,
): Readonly<Record<string, boolean | null | readonly string[]>> {
	const now = Math.floor(Date.now() / 1000);
	const exp = payload['exp'];
	const nbf = payload['nbf'];
	const aud = payload['aud'];
	return {
		expValid: typeof exp === 'number' ? now < exp : null,
		nbfValid: typeof nbf === 'number' ? now >= nbf : null,
		issuerMatches: checks.issuer ? payload['iss'] === checks.issuer : null,
		audienceMatches: checks.audience
			? Array.isArray(aud)
				? aud.includes(checks.audience)
				: aud === checks.audience
			: null,
		numericDateTypeErrors: ['exp', 'nbf', 'iat'].filter(
			(claim) => payload[claim] !== undefined && typeof payload[claim] !== 'number',
		),
	};
}

export async function inspectJwt(
	token: string,
	keySource: string,
	checks: ClaimChecks,
): Promise<Readonly<Record<string, unknown>>> {
	const decoded = decode(token);
	const hasKey = Boolean(keySource.trim());
	const signatureValid = hasKey ? await verifySignature(token, decoded.header, keySource) : null;
	return {
		...decoded,
		verification: { signatureValid },
		claimEvaluation: evaluateClaims(decoded.payload, checks),
	};
}
