import { describe, expect, it } from 'vitest';
import { exportJWK, generateKeyPair, SignJWT } from 'jose';

import { inspectJwt } from '@app/features/tools/security/jwt-verification';

async function fixture(
	algorithm: 'RS256' | 'ES256',
	claims: Record<string, unknown> = {},
	includeKid = true,
) {
	const { privateKey, publicKey } = await generateKeyPair(algorithm);
	const publicJwk = await exportJWK(publicKey);
	const token = await new SignJWT({ sub: 'local-test', ...claims })
		.setProtectedHeader({ alg: algorithm, ...(includeKid ? { kid: 'key-1' } : {}) })
		.sign(privateKey);
	return { publicJwk: { ...publicJwk, kid: 'key-1', alg: algorithm, use: 'sig' }, token };
}

describe('inspectJwt', () => {
	it.each(['RS256', 'ES256'] as const)('verifies a valid %s signature', async (algorithm) => {
		const { token, publicJwk } = await fixture(algorithm);
		const result = await inspectJwt(token, JSON.stringify(publicJwk), {});
		expect(result['verification']).toEqual({ signatureValid: true });
	});

	it('keeps decoding available and marks the signature as unchecked without a key', async () => {
		const { token } = await fixture('RS256');
		const result = await inspectJwt(token, '', {});
		expect(result['verification']).toEqual({ signatureValid: null });
	});

	it('reports a tampered signature as invalid', async () => {
		const { token, publicJwk } = await fixture('RS256');
		const [header, payload, signature] = token.split('.');
		const replacement = signature?.startsWith('A') ? 'B' : 'A';
		const result = await inspectJwt(
			`${header}.${payload}.${replacement}${signature?.slice(1)}`,
			JSON.stringify(publicJwk),
			{},
		);
		expect(result['verification']).toEqual({ signatureValid: false });
	});

	it('reports an unrelated public key as an invalid signature', async () => {
		const signed = await fixture('RS256');
		const unrelated = await fixture('RS256');
		const result = await inspectJwt(signed.token, JSON.stringify(unrelated.publicJwk), {});
		expect(result['verification']).toEqual({ signatureValid: false });
	});

	it('evaluates expiry, not-before, issuer, and audience independently', async () => {
		const now = Math.floor(Date.now() / 1000);
		const { token, publicJwk } = await fixture('RS256', {
			exp: now - 10,
			nbf: now + 10,
			iss: 'https://issuer.example',
			aud: ['client-a', 'client-b'],
		});
		const result = await inspectJwt(token, JSON.stringify(publicJwk), {
			issuer: 'https://other.example',
			audience: 'client-b',
		});
		expect(result['claimEvaluation']).toMatchObject({
			expValid: false,
			nbfValid: false,
			issuerMatches: false,
			audienceMatches: true,
		});
		expect(result['verification']).toEqual({ signatureValid: true });
	});

	it('rejects unsupported algorithms, including none', async () => {
		const { token } = await fixture('RS256');
		const [, payload, signature] = token.split('.');
		const encodedHeader = btoa(JSON.stringify({ alg: 'none' }))
			.replace(/=/g, '')
			.replace(/\+/g, '-')
			.replace(/\//g, '_');
		await expect(
			inspectJwt(`${encodedHeader}.${payload}.${signature}`, '{}', {}),
		).rejects.toMatchObject({
			translationKey: 'tools.jwt.unsupported_algorithm',
		});
	});

	it('rejects an ambiguous key selection when kid is absent and multiple keys match', async () => {
		const first = await fixture('RS256');
		const second = await fixture('RS256');
		const noKid = await fixture('RS256', {}, false);
		await expect(
			inspectJwt(
				noKid.token,
				JSON.stringify({ keys: [first.publicJwk, { ...second.publicJwk, kid: 'key-2' }] }),
				{},
			),
		).rejects.toMatchObject({ translationKey: 'tools.jwt.ambiguous_key_id' });
	});

	it('rejects a JWK set with a duplicate matching kid', async () => {
		const first = await fixture('RS256');
		const second = await fixture('RS256');
		await expect(
			inspectJwt(first.token, JSON.stringify({ keys: [first.publicJwk, second.publicJwk] }), {}),
		).rejects.toMatchObject({ translationKey: 'tools.jwt.ambiguous_key_id' });
	});

	it('rejects a JWKS without the token kid', async () => {
		const first = await fixture('RS256');
		const second = await fixture('RS256');
		await expect(
			inspectJwt(
				first.token,
				JSON.stringify({ keys: [{ ...second.publicJwk, kid: 'another-key' }] }),
				{},
			),
		).rejects.toMatchObject({ translationKey: 'tools.jwt.key_id_not_found' });
	});

	it('rejects a key with the wrong algorithm family', async () => {
		const rsa = await fixture('RS256');
		await expect(
			inspectJwt(rsa.token, JSON.stringify({ ...rsa.publicJwk, kty: 'EC' }), {}),
		).rejects.toMatchObject({
			translationKey: 'tools.jwt.no_compatible_key',
		});
	});
});
