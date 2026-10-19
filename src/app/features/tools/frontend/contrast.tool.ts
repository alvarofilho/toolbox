import { parse, formatHex, wcagContrast } from 'culori';

import { tool, result } from '@app/features/tools/_shared/definition';

import { field } from '@app/core/models/tool';

import { preview } from '@app/features/tools/_shared/preview';

import { colorInput } from '@app/features/tools/frontend/controls';

export const definition = tool(
	'contrast',
	[
		colorInput('foreground', 'Cor do texto (opaca)', 'Text color (opaque)', '#176b46'),
		colorInput('background', 'Cor de fundo (opaca)', 'Background color (opaque)', '#ffffff'),
	],
	(v) => {
		const a = parse(field(v, 'foreground')),
			b = parse(field(v, 'background'));
		if (!a || !b) {
			throw new Error('Cor inválida / Invalid color');
		}
		if ((a.alpha ?? 1) !== 1 || (b.alpha ?? 1) !== 1) {
			throw new Error('Use cores opacas / Use opaque colors');
		}
		const ratio = wcagContrast(a, b);
		return {
			...result({
				ratio: Number(ratio.toFixed(3)),
				AA: { normalText: ratio >= 4.5, largeText: ratio >= 3 },
				AAA: { normalText: ratio >= 7, largeText: ratio >= 4.5 },
				nonText: ratio >= 3,
			}),
			preview: preview(
				`<div style="padding:32px;color:${formatHex(a)};background:${formatHex(b)}"><p style="font-size:18px">Texto de exemplo / Sample text</p><p style="font-size:28px;font-weight:bold">${ratio.toFixed(2)}:1</p></div>`,
			),
		};
	},
);
