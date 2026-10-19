import { parse, formatHex, formatHex8, formatRgb, formatHsl } from 'culori';

import { tool, result } from '@app/features/tools/_shared/definition';

import { source } from '@app/features/tools/_shared/controls';

import { field } from '@app/core/models/tool';

import { preview, escapeHtml } from '@app/features/tools/_shared/preview';

import { rgb } from '@app/features/tools/frontend/colors';

export const definition = tool(
	'color',
	[source],
	(v) => {
		const c = parse(field(v, 'input'));
		if (!c) {
			throw new Error('Cor CSS inválida / Invalid CSS color');
		}
		return {
			...result({
				hex: formatHex(c),
				hex8: formatHex8(c),
				rgb: formatRgb(c),
				hsl: formatHsl(c),
				channels: rgb(c),
			}),
			preview: preview(
				`<div style="height:160px;background:${escapeHtml(formatHex(c))};border:1px solid #aaa;border-radius:8px"></div>`,
			),
		};
	},
	{ input: '#176b46' },
);
