import { input } from '@app/features/tools/_shared/controls';

import { field } from '@app/core/models/tool';

import { records } from '@app/features/tools/generators/record-generation';

export const definition = records(
	'random-date',
	(v) => {
		const min = Date.parse(field(v, 'start')),
			max = Date.parse(field(v, 'end'));
		if (!Number.isFinite(min) || !Number.isFinite(max) || max < min) {
			throw new Error('Intervalo de datas inválido / Invalid date range');
		}
		const n = crypto.getRandomValues(new Uint32Array(1))[0] / 4294967296;
		return { date: new Date(min + Math.floor(n * (max - min + 1))).toISOString() };
	},
	[
		input('start', 'common.iso_start', '2020-01-01T00:00:00Z', 'text'),
		input('end', 'common.iso_end', '2030-01-01T00:00:00Z', 'text'),
	],
);
