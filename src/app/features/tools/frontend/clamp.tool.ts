import { tool, result } from '@app/features/tools/_shared/definition';

import { field } from '@app/core/models/tool';

import { preview } from '@app/features/tools/_shared/preview';

import { size } from '@app/features/tools/frontend/controls';

export function clampCss(
	minSize: number,
	maxSize: number,
	minWidth: number,
	maxWidth: number,
): string {
	if (
		![minSize, maxSize, minWidth, maxWidth].every(Number.isFinite) ||
		maxWidth <= minWidth ||
		maxSize < minSize ||
		minSize < 0 ||
		minWidth <= 0
	) {
		throw new Error('Use máximo ≥ mínimo e largura máxima > mínima > 0 / Invalid size/width range');
	}
	const slope = ((maxSize - minSize) / (maxWidth - minWidth)) * 100,
		intercept = minSize - (slope * minWidth) / 100;
	return `clamp(${minSize}px, ${Number(intercept.toFixed(6))}px + ${Number(slope.toFixed(6))}vw, ${maxSize}px)`;
}

export const definition = tool(
	'clamp',
	[
		size(
			'min',
			'Tamanho mínimo (px)',
			'Minimum size (px)',
			16,
			undefined,
			undefined,
			'tools.clamp',
		),
		size(
			'max',
			'Tamanho máximo (px)',
			'Maximum size (px)',
			32,
			undefined,
			undefined,
			'tools.clamp',
		),
		size('minWidth', 'Viewport mínimo (px)', 'Minimum viewport (px)', 320, 1, 5000, 'tools.clamp'),
		size('maxWidth', 'Viewport máximo (px)', 'Maximum viewport (px)', 1440, 1, 5000, 'tools.clamp'),
	],
	(v) => {
		const css = clampCss(
			Number(field(v, 'min')),
			Number(field(v, 'max')),
			Number(field(v, 'minWidth')),
			Number(field(v, 'maxWidth')),
		);
		return {
			...result(`font-size: ${css};`, 'clamp.css'),
			preview: preview(`<p style="font-size:${css}">Uma tipografia que acompanha o espaço.</p>`),
		};
	},
);
