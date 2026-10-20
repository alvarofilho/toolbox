import { field, type ToolDefinition } from '@app/core/models/tool';
import { convertCase } from '@app/features/tools/_shared/encoding';
import { source, select, transform } from '@app/features/tools/_shared/controls';

export const definition: ToolDefinition = {
	id: 'case',
	controls: [
		source,
		select(
			'mode',
			'tools.case.format',
			[
				['camel', 'tools.case.camelcase'],
				['pascal', 'tools.case.pascalcase'],
				['snake', 'tools.case.snake_case'],
				['kebab', 'tools.case.kebab_case'],
				['upper', 'tools.case.uppercase'],
				['lower', 'tools.case.lowercase'],
			],
			undefined,
		),
	],
	action: transform,
	example: { input: 'Minha primeira ferramenta', mode: 'camel' },
	run: (v) => ({ output: convertCase(field(v, 'input'), field(v, 'mode')) }),
};
