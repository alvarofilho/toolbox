import { Temporal } from '@js-temporal/polyfill';

import { tool, result } from '@app/features/tools/_shared/definition';

import { source } from '@app/features/tools/_shared/controls';

import { mode } from '@app/features/tools/_shared/execution-controls';

import { field } from '@app/core/models/tool';

export const definition = tool(
	'dotnet-ticks',
	[source, mode(['ticks-to-iso', 'iso-to-ticks'])],
	(v) => {
		const offset = 621355968000000000n;
		if (field(v, 'mode') === 'iso-to-ticks') {
			const raw = field(v, 'input').trim();
			if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,7})?(?:Z|[+-]\d{2}:\d{2})$/.test(raw)) {
				throw new Error('ISO 8601 com fuso obrigatório / ISO 8601 with timezone required');
			}
			const ticks = Temporal.Instant.from(raw).epochNanoseconds / 100n + offset;
			if (ticks < 0n || ticks > 3155378975999999999n) {
				throw new Error('Fora do intervalo DateTime / Outside DateTime range');
			}
			return result({ ticks: ticks.toString() });
		}
		if (!/^\d{1,19}$/.test(field(v, 'input').trim())) {
			throw new Error('Ticks inválidos / Invalid ticks');
		}
		const ticks = BigInt(field(v, 'input'));
		if (ticks > 3155378975999999999n) {
			throw new Error('Fora do intervalo DateTime / Outside DateTime range');
		}
		const delta = ticks - offset,
			ms = delta >= 0n ? delta / 10000n : (delta - 9999n) / 10000n;
		const fraction = (ticks % 10000000n).toString().padStart(7, '0');
		return result({
			utc: new Date(Number(ms)).toISOString().replace(/\.\d{3}Z$/, `.${fraction}Z`),
			ticks: ticks.toString(),
		});
	},
	{ input: '621355968000000000' },
);
