import { tool, result } from '@app/features/tools/_shared/definition';

import { field } from '@app/core/models/tool';

import { preview } from '@app/features/tools/_shared/preview';

import { colorInput, size } from '@app/features/tools/frontend/controls';

import { color } from '@app/features/tools/frontend/colors';

export const definition = tool(
	'gradient',
	[
		colorInput('start', 'Cor inicial', 'Start color', '#176b46', 'tools.gradient'),
		colorInput('end', 'Cor final', 'End color', '#e6c66b', 'tools.gradient'),
		size('angle', 'Ângulo (graus)', 'Angle (degrees)', 135, 0, 360, 'tools.gradient'),
	],
	(v) => {
		const css = `linear-gradient(${Number(field(v, 'angle'))}deg, ${color(field(v, 'start'))}, ${color(field(v, 'end'))})`;
		return {
			...result(`background: ${css};`, 'gradient.css'),
			preview: preview(`<div style="height:240px;background:${css};border-radius:12px"></div>`),
		};
	},
);
