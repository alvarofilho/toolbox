import QRCode from 'qrcode';

import { tool, result } from '@app/features/tools/_shared/definition';

import { select, number, source } from '@app/features/tools/_shared/controls';

import { field, boundedNumber } from '@app/core/models/tool';

import { preview } from '@app/features/tools/_shared/preview';

export const definition = tool(
	'qr',
	[
		source,
		number('size', 'tools.qr.size_px', 256, 64, 1024, undefined),
		select(
			'level',
			'tools.qr.error_correction',
			[
				['L', 'tools.qr.l'],
				['M', 'tools.qr.m'],
				['Q', 'tools.qr.q'],
				['H', 'tools.qr.h'],
			],
			'M',
		),
	],
	async (v) => {
		if (!field(v, 'input').trim() || field(v, 'input').length > 2000) {
			throw new Error('Use 1–2.000 caracteres / characters');
		}
		const level = field(v, 'level');
		if (level !== 'L' && level !== 'M' && level !== 'Q' && level !== 'H') {
			throw new Error('Invalid correction level');
		}
		const svg = await QRCode.toString(field(v, 'input'), {
			type: 'svg',
			width: boundedNumber(field(v, 'size'), 64, 1024),
			errorCorrectionLevel: level,
		});
		return {
			...result(svg, 'qrcode.svg'),
			mime: 'image/svg+xml',
			preview: preview(svg),
			artifacts: [{ blob: new Blob([svg], { type: 'image/svg+xml' }), filename: 'qrcode.svg' }],
		};
	},
	{ input: 'https://example.com' },
);
