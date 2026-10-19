import { field, text, type ToolDefinition } from '@app/core/models/tool';
import { timestamp } from '@app/shared/utils/encoding';
import { input, select } from '@app/features/tools/controls';

export const definition: ToolDefinition = {
	id: 'timestamp',
	controls: [
		input('input', 'Data ou timestamp', 'Date or timestamp', '', 'text'),
		select('mode', 'Unidade da entrada', 'Input unit', [
			['seconds', 'Unix · segundos', 'Unix · seconds'],
			['milliseconds', 'Unix · milissegundos', 'Unix · milliseconds'],
			['iso', 'ISO 8601 com fuso horário', 'ISO 8601 with timezone'],
		]),
	],
	action: text('Converter data', 'Convert date'),
	example: { input: '1767225600', mode: 'seconds' },
	run: (v) => ({
		output: timestamp(field(v, 'input').trim(), field(v, 'mode')),
		filename: 'timestamp.json',
		mime: 'application/json',
	}),
};
