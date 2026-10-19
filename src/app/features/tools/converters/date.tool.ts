import { Temporal } from '@js-temporal/polyfill';

import { tool, result } from '@app/features/tools/_shared/definition';

import { source, select } from '@app/features/tools/_shared/controls';

import { field } from '@app/core/models/tool';

export const definition = tool(
	'date',
	[
		source,
		select('from', 'Formato de entrada', 'Input format', [
			['iso', 'ISO 8601', 'ISO 8601'],
			['br', 'DD/MM/YYYY', 'DD/MM/YYYY'],
			['us', 'MM/DD/YYYY', 'MM/DD/YYYY'],
			['unix', 'Unix seconds', 'Unix seconds'],
		]),
	],
	(v) => {
		let date: Temporal.PlainDate;
		const raw = field(v, 'input').trim(),
			from = field(v, 'from');
		if (from === 'br' || from === 'us') {
			const m = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(raw);
			if (!m) {
				throw new Error('Use DD/MM/YYYY ou MM/DD/YYYY');
			}
			date = Temporal.PlainDate.from(
				{
					year: Number(m[3]),
					month: Number(m[from === 'br' ? 2 : 1]),
					day: Number(m[from === 'br' ? 1 : 2]),
				},
				{ overflow: 'reject' },
			);
		} else if (from === 'unix') {
			if (!/^-?\d+$/.test(raw)) {
				throw new Error('Unix seconds expected');
			}
			date = Temporal.Instant.fromEpochNanoseconds(BigInt(raw) * 1000000000n)
				.toZonedDateTimeISO('UTC')
				.toPlainDate();
		} else {
			date =
				raw.length === 10
					? Temporal.PlainDate.from(raw)
					: Temporal.Instant.from(raw).toZonedDateTimeISO('UTC').toPlainDate();
		}
		const mm = String(date.month).padStart(2, '0'),
			dd = String(date.day).padStart(2, '0');
		return result({
			iso: date.toString(),
			br: `${dd}/${mm}/${date.year}`,
			us: `${mm}/${dd}/${date.year}`,
			weekday: date.dayOfWeek,
			unixUtcMidnight: date.toZonedDateTime('UTC').epochMilliseconds / 1000,
		});
	},
	{ input: '2026-01-01' },
);
