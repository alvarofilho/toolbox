import { field, type ToolDefinition } from '@app/core/models/tool';
import { source, select } from '@app/features/tools/_shared/controls';

export const definition: ToolDefinition = {
	id: 'json-formatter',
	controls: [
		source,
		select(
			'indent',
			'tools.json-formatter.indentation',
			[
				['2', 'tools.json-formatter.2_spaces'],
				['4', 'tools.json-formatter.4_spaces'],
			],
			undefined,
		),
	],
	action: 'tools.json-formatter.format_and_validate',
	example: { input: '{"project":"Toolbox","local":true,"tools":["JSON","CPF"]}' },
	run: (v) => ({
		output: JSON.stringify(JSON.parse(field(v, 'input')), null, Number(field(v, 'indent'))),
		filename: 'formatted.json',
		mime: 'application/json',
		notice: 'tools.json-formatter.valid_json',
	}),
};
