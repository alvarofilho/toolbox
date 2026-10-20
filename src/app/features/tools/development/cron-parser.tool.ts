import { tool, result } from '@app/features/tools/_shared/definition';

import { source, input } from '@app/features/tools/_shared/controls';

import { field } from '@app/core/models/tool';

import { cron } from '@app/features/tools/development/cron';

export const definition = tool(
	'cron-parser',
	[
		source,
		input('zone', 'tools.cron-parser.iana_timezone', 'America/Sao_Paulo', 'text'),
		input('start', 'tools.cron-parser.starting_at_iso', '2026-01-01T00:00:00Z', 'text'),
	],
	(v) => result(cron(field(v, 'input'), field(v, 'zone'), field(v, 'start'))),
	{ input: '*/15 * * * *' },
);
