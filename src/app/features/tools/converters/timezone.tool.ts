import { Temporal } from '@js-temporal/polyfill';

import { tool, result } from '@app/features/tools/_shared/definition';

import { input } from '@app/features/tools/_shared/controls';

import { field } from '@app/core/models/tool';

export const definition = tool(
	'timezone',
	[
		input(
			'input',
			'Data/hora local (ISO, sem offset)',
			'Local date/time (ISO, without offset)',
			'2026-01-01T12:00:00',
			'text',
		),
		input('from', 'Fuso de origem (IANA)', 'Source timezone (IANA)', 'America/Sao_Paulo', 'text'),
		input('to', 'Fuso de destino (IANA)', 'Target timezone (IANA)', 'Europe/Lisbon', 'text'),
	],
	(v) => {
		const local = Temporal.PlainDateTime.from(field(v, 'input'));
		const source = local.toZonedDateTime(field(v, 'from'), {
			disambiguation: 'reject',
		});
		return result({
			source: source.toString(),
			target: source.withTimeZone(field(v, 'to')).toString(),
			utc: source.toInstant().toString(),
		});
	},
);
