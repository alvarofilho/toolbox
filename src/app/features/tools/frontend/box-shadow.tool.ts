import { parse } from 'culori';

import { tool, result } from '@app/features/tools/_shared/definition';

import { field } from '@app/core/models/tool';

import { preview } from '@app/features/tools/_shared/preview';

import { size, colorInput } from '@app/features/tools/frontend/controls';

import { rgb, color } from '@app/features/tools/frontend/colors';

export const definition = tool(
	'box-shadow',
	[
		size('x', 'tools.box-shadow.x_offset_px', 0, -200, 200),
		size('y', 'tools.box-shadow.y_offset_px', 8, -200, 200),
		size('blur', 'tools.box-shadow.blur_px', 24, 0, 200),
		size('spread', 'tools.box-shadow.spread_px', 0, -100, 100),
		colorInput('color', 'tools.box-shadow.color', '#173d2b'),
		size('opacity', 'tools.box-shadow.opacity', 25, 0, 100),
	],
	(v) => {
		const c = rgb(parse(color(field(v, 'color'))));
		if (!c) {
			throw new Error('Invalid color');
		}
		const rgba = `rgb(${Math.round(c.r * 255)} ${Math.round(c.g * 255)} ${Math.round(c.b * 255)} / ${Number(field(v, 'opacity')) / 100})`;
		const css = `${Number(field(v, 'x'))}px ${Number(field(v, 'y'))}px ${Number(field(v, 'blur'))}px ${Number(field(v, 'spread'))}px ${rgba}`;
		return {
			...result(`box-shadow: ${css};`, 'shadow.css'),
			preview: preview(
				`<div style="margin:40px;padding:40px;background:white;border-radius:12px;box-shadow:${css}">CSS Box Shadow</div>`,
			),
		};
	},
);
