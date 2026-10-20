import { field, boundedNumber, type ToolDefinition } from '@app/core/models/tool';
import { uuid } from '@app/features/tools/_shared/random';
import { select, number, generate } from '@app/features/tools/_shared/controls';

export const definition: ToolDefinition = {
	id: 'uuid',
	controls: [
		select(
			'version',
			'tools.uuid.version',
			[
				['4', 'tools.uuid.uuid_v4_random'],
				['7', 'tools.uuid.uuid_v7_time_ordered'],
			],
			undefined,
		),
		number('count', 'tools.uuid.count', 1, 1, 1000, undefined),
	],
	action: generate,
	run: (v) => ({
		output: Array.from({ length: boundedNumber(field(v, 'count'), 1, 1000) }, () =>
			uuid(field(v, 'version')),
		).join('\n'),
		filename: 'uuids.txt',
	}),
};
