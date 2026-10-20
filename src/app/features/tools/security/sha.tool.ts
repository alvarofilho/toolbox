import { field, type ToolDefinition } from '@app/core/models/tool';
import { hex } from '@app/features/tools/_shared/random';
import { source, select } from '@app/features/tools/_shared/controls';

export const definition: ToolDefinition = {
	id: 'sha',
	controls: [
		source,
		select(
			'algorithm',
			'tools.sha.algorithm',
			[
				['SHA-256', 'tools.sha.sha_256'],
				['SHA-512', 'tools.sha.sha_512'],
			],
			undefined,
		),
	],
	action: 'tools.sha.calculate_hash',
	example: { input: 'abc', algorithm: 'SHA-256' },
	hint: 'tools.sha.hash_of_utf_8_text_this_is_not_reversible_',
	run: async (v) => ({
		output: hex(
			new Uint8Array(
				await crypto.subtle.digest(
					field(v, 'algorithm'),
					new TextEncoder().encode(field(v, 'input')),
				),
			),
		),
	}),
};
