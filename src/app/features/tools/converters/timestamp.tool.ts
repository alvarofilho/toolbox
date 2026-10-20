import { field, type ToolDefinition } from '@app/core/models/tool';
import { timestamp } from '@app/features/tools/_shared/encoding';
import { input, select } from '@app/features/tools/_shared/controls';

export const definition: ToolDefinition = {
	id: 'timestamp',
	controls: [
		input('input', 'tools.timestamp.date_or_timestamp', '', 'text'),
		select(
			'mode',
			'tools.timestamp.input_unit',
			[
				['seconds', 'tools.timestamp.unix_seconds_with_separator'],
				['milliseconds', 'tools.timestamp.unix_milliseconds'],
				['iso', 'tools.timestamp.iso_8601_with_timezone'],
			],
			undefined,
		),
	],
	action: 'tools.timestamp.convert_date',
	example: { input: '1767225600', mode: 'seconds' },
	run: (v) => ({
		output: timestamp(field(v, 'input').trim(), field(v, 'mode')),
		filename: 'timestamp.json',
		mime: 'application/json',
	}),
};
