import { tool, result } from '@app/features/tools/_shared/definition';

import { input } from '@app/features/tools/_shared/controls';

import { field, type TranslationKey } from '@app/core/models/tool';

import { cron } from '@app/features/tools/development/cron';

const cronFields: readonly (readonly [string, TranslationKey])[] = [
	['minute', 'tools.cron-builder.minute'],
	['hour', 'tools.cron-builder.hour'],
	['day', 'tools.cron-builder.day_of_month'],
	['month', 'tools.cron-builder.month'],
	['weekday', 'tools.cron-builder.weekday'],
];

export const definition = tool(
	'cron-builder',
	[
		...cronFields.map(([key, label], i) => input(key, label, i === 0 ? '*/15' : '*', 'text')),
		input('zone', 'tools.cron-builder.iana_timezone', 'America/Sao_Paulo', 'text'),
		input('start', 'tools.cron-builder.starting_at_iso', '2026-01-01T00:00:00Z', 'text'),
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
