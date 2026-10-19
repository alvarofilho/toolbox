import { tool, result } from '@app/features/tools/_shared/definition';

import { input } from '@app/features/tools/_shared/controls';

import { field } from '@app/core/models/tool';

import { cron } from '@app/features/tools/development/cron';

export const definition = tool(
	'cron-builder',
	[
		...['minute', 'hour', 'day', 'month', 'weekday'].map((key, i) =>
			input(
				key,
				['Minuto', 'Hora', 'Dia do mês', 'Mês', 'Dia da semana'][i],
				['Minute', 'Hour', 'Day of month', 'Month', 'Weekday'][i],
				i === 0 ? '*/15' : '*',
				'text',
			),
		),
		input('zone', 'Fuso IANA', 'IANA timezone', 'America/Sao_Paulo', 'text'),
		input('start', 'A partir de (ISO)', 'Starting at (ISO)', '2026-01-01T00:00:00Z', 'text'),
	],
	(v) =>
		result(
			cron(
				['minute', 'hour', 'day', 'month', 'weekday'].map((k) => field(v, k)).join(' '),
				field(v, 'zone'),
				field(v, 'start'),
			),
		),
);
