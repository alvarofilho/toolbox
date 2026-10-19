import { field, type ToolDefinition } from '@app/core/models/tool';
import { convertCase } from '@app/features/tools/_shared/encoding';
import { source, select, transform } from '@app/features/tools/_shared/controls';

export const definition: ToolDefinition = {
	id: 'case',
	controls: [
		source,
		select(
			'mode',
			'Formato',
			'Format',
			[
				['camel', 'camelCase', 'camelCase'],
				['pascal', 'PascalCase', 'PascalCase'],
				['snake', 'snake_case', 'snake_case'],
				['kebab', 'kebab-case', 'kebab-case'],
				['upper', 'MAIÚSCULAS', 'UPPERCASE'],
				['lower', 'minúsculas', 'lowercase'],
			],
			undefined,
			'tools.case',
		),
	],
	action: transform,
	example: { input: 'Minha primeira ferramenta', mode: 'camel' },
	run: (v) => ({ output: convertCase(field(v, 'input'), field(v, 'mode')) }),
};
