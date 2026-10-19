import semver from 'semver';

import { tool, result } from '@app/features/tools/_shared/definition';

import { source, input } from '@app/features/tools/_shared/controls';

import { second } from '@app/features/tools/_shared/execution-controls';

import { field } from '@app/core/models/tool';

export const definition = tool(
	'semver',
	[
		source,
		second,
		input('range', 'Intervalo semver (opcional)', 'Semver range (optional)', '^1.0.0', 'text'),
	],
	(v) => {
		const a = field(v, 'input').trim(),
			b = field(v, 'second').trim(),
			range = field(v, 'range');
		if (!semver.valid(a) || !semver.valid(b)) {
			throw new Error('Versões semver inválidas / Invalid semver versions');
		}
		if (range && !semver.validRange(range)) {
			throw new Error('Intervalo inválido / Invalid range');
		}
		const compared = semver.compare(a, b);
		return result({
			first: a,
			second: b,
			comparison: compared,
			relation: compared < 0 ? 'older' : compared > 0 ? 'newer' : 'equal',
			firstSatisfies: range ? semver.satisfies(a, range) : null,
			secondSatisfies: range ? semver.satisfies(b, range) : null,
			difference: semver.diff(a, b),
		});
	},
	{ input: '1.2.3', second: '2.0.0' },
);
