import DOMPurify from 'dompurify';

import { optimize } from 'svgo/browser';

import { tool, result } from '@app/features/tools/_shared/definition';

import { source } from '@app/features/tools/_shared/controls';

import { field, text } from '@app/core/models/tool';

import { preview } from '@app/features/tools/_shared/preview';

export const definition = tool(
	'svg-optimizer',
	[source],
	(v) => {
		const input = field(v, 'input');
		if (!/<svg[\s>]/i.test(input)) {
			throw new Error('SVG esperado / Expected SVG');
		}
		const clean = DOMPurify.sanitize(input, {
			USE_PROFILES: { svg: true, svgFilters: true },
			FORBID_TAGS: [
				'style',
				'foreignObject',
				'image',
				'a',
				'use',
				'animate',
				'animateTransform',
				'set',
			],
			FORBID_ATTR: ['style', 'href', 'xlink:href'],
		});
		const svg = optimize(clean, { multipass: true }).data;
		return {
			...result(svg, 'optimized.svg'),
			mime: 'image/svg+xml',
			preview: preview(svg),
			notice: text(
				`${input.length} → ${svg.length} caracteres`,
				`${input.length} → ${svg.length} characters`,
			),
		};
	},
	{
		input:
			'<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><!-- test --><rect x="10" y="10" width="80" height="80" fill="#007744"/></svg>',
	},
);
