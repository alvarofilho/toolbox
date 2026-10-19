import { tool, result } from '@app/features/tools/_shared/definition';

import { source, select } from '@app/features/tools/_shared/controls';

import { field } from '@app/core/models/tool';

export const definition = tool(
	'guid-formatter',
	[
		source,
		select(
			'format',
			'Formato',
			'Format',
			['D', 'N', 'B', 'P', 'X'].map((s) => [s, s, s]),
		),
	],
	(v) => {
		const raw = field(v, 'input').trim();
		let s: string;
		if (
			/^\{0x[\da-f]{8},0x[\da-f]{4},0x[\da-f]{4},\{(?:0x[\da-f]{2},){7}0x[\da-f]{2}\}\}$/i.test(raw)
		) {
			s = raw.replace(/0x/gi, '').replace(/[{},]/g, '');
		} else if (
			/^(?:[\da-f]{32}|[\da-f]{8}-(?:[\da-f]{4}-){3}[\da-f]{12}|\{[\da-f]{8}-(?:[\da-f]{4}-){3}[\da-f]{12}\}|\([\da-f]{8}-(?:[\da-f]{4}-){3}[\da-f]{12}\))$/i.test(
				raw,
			)
		) {
			s = raw.replace(/[{}()-]/g, '');
		} else {
			throw new Error('GUID inválido / Invalid GUID');
		}
		s = s.toLowerCase();
		const d = `${s.slice(0, 8)}-${s.slice(8, 12)}-${s.slice(12, 16)}-${s.slice(16, 20)}-${s.slice(20)}`;
		return result(
			field(v, 'format') === 'N'
				? s
				: field(v, 'format') === 'B'
					? `{${d}}`
					: field(v, 'format') === 'P'
						? `(${d})`
						: field(v, 'format') === 'X'
							? `{0x${s.slice(0, 8)},0x${s.slice(8, 12)},0x${s.slice(12, 16)},{${(s.slice(16).match(/../g) ?? []).map((b) => `0x${b}`).join(',')}}}`
							: d,
			'guid.txt',
		);
	},
	{ input: '550e8400e29b41d4a716446655440000' },
);
