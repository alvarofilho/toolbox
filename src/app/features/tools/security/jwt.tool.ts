import { field, type ToolDefinition } from '@app/core/models/tool';
import { decodeJwt } from '@app/features/tools/_shared/encoding';
import { source } from '@app/features/tools/_shared/controls';

export const definition: ToolDefinition = {
	id: 'jwt',
	controls: [source],
	action: 'tools.jwt.decode_jwt',
	hint: 'tools.jwt.decoding_only_the_token_signature_and_auth',
	example: {
		input:
			'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ0ZXN0ZSIsIm5hbWUiOiJBbmEiLCJleHAiOjE3NjcyMjU2MDB9.c2lnbmF0dXJl',
	},
	run: (v) => ({
		output: decodeJwt(field(v, 'input')),
		filename: 'jwt.json',
		mime: 'application/json',
	}),
};
