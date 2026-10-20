import { field, boundedNumber, type ToolDefinition } from '@app/core/models/tool';
import { hex } from '@app/features/tools/_shared/random';
import { select, number, generate } from '@app/features/tools/_shared/controls';

export const definition: ToolDefinition = {
	id: 'token',
	controls: [
		number('bytes', 'tools.token.entropy_bytes', 32, 16, 256, undefined),
		select(
			'encoding',
			'tools.token.format',
			[
				['hex', 'tools.token.hexadecimal'],
				['base64', 'tools.token.standard_base64'],
				['base64url', 'tools.token.base64_url_safe'],
			],
			undefined,
		),
	],
	action: generate,
	run: (v) => {
		const bytes = crypto.getRandomValues(new Uint8Array(boundedNumber(field(v, 'bytes'), 16, 256)));
		return {
			output: (() => {
				const base64 = btoa(Array.from(bytes, (b) => String.fromCharCode(b)).join(''));
				switch (field(v, 'encoding')) {
					case 'hex':
						return hex(bytes);
					case 'base64':
						return base64;
					default:
						return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
				}
			})(),
		};
	},
};
