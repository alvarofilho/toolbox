import 'reflect-metadata';

import { decodeJwt } from '@app/features/tools/_shared/encoding';

import { tool, result } from '@app/features/tools/_shared/definition';

import { source, input } from '@app/features/tools/_shared/controls';

import { field } from '@app/core/models/tool';

import { json, object } from '@app/features/tools/_shared/data';

import { decodeHint } from '@app/features/tools/security/decoding-hint';

export const definition = tool(
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
);
