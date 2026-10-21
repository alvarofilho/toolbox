import { field, type ToolDefinition } from '@app/core/models/tool';
import { input, source } from '@app/features/tools/_shared/controls';
import { decodeHint } from '@app/features/tools/security/decoding-hint';
import { inspectJwt } from '@app/features/tools/security/jwt-verification';

export const definition: ToolDefinition = {
	id: 'jwt',
	controls: [
		source,
		input('key', 'tools.jwt.public_key_or_jwks_optional'),
		input('issuer', 'tools.jwt.expected_issuer_optional', '', 'text'),
		input('audience', 'tools.jwt.expected_audience_optional', '', 'text'),
	],
	action: 'tools.jwt.verify_or_decode',
	hint: decodeHint,
	example: {
		input:
			'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ0ZXN0ZSIsIm5hbWUiOiJBbmEiLCJleHAiOjE3NjcyMjU2MDB9.c2lnbmF0dXJl',
	},
	run: async (v) => ({
		output: JSON.stringify(
			await inspectJwt(field(v, 'input'), field(v, 'key'), {
				issuer: field(v, 'issuer'),
				audience: field(v, 'audience'),
			}),
			null,
			2,
		),
		filename: 'jwt.json',
		mime: 'application/json',
		notice: 'tools.jwt.key_defines_trust',
	}),
};
