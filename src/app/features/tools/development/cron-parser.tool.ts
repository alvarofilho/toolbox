import { tool, result } from '@app/features/tools/_shared/definition';

import { source, input } from '@app/features/tools/_shared/controls';

import { field } from '@app/core/models/tool';

import { cron } from '@app/features/tools/development/cron';

export const definition = tool(
	'cron-parser',
	[
		source,
		input('zone', 'Fuso IANA', 'IANA timezone', 'America/Sao_Paulo', 'text', 'tools.cron-parser'),
		input(
			'start',
			'A partir de (ISO)',
			'Starting at (ISO)',
			'2026-01-01T00:00:00Z',
			'text',
			'tools.cron-parser',
		),
	],
	(v) => result(cron(field(v, 'input'), field(v, 'zone'), field(v, 'start'))),
	{ input: '*/15 * * * *' },
);
