import { tool, result } from '@app/features/tools/_shared/definition';

import { select } from '@app/features/tools/_shared/controls';

import { field, type TranslationKey } from '@app/core/models/tool';

import { preview } from '@app/features/tools/_shared/preview';

import { size } from '@app/features/tools/frontend/controls';

const choose = (key: string, label: TranslationKey, options: readonly string[]) =>
	select(
		key,
		label,
		options.map((value) => [value]),
	);

export const definition = tool(
	'flexbox',
	[
		choose('direction', 'tools.flexbox.direction', [
			'row',
			'column',
			'row-reverse',
			'column-reverse',
		]),
		choose('justify', 'tools.flexbox.main_axis_alignment', [
			'flex-start',
			'center',
			'flex-end',
			'space-between',
			'space-around',
			'space-evenly',
		]),
		choose('align', 'tools.flexbox.cross_axis_alignment', [
			'stretch',
			'flex-start',
			'center',
			'flex-end',
			'baseline',
		]),
		choose('wrap', 'tools.flexbox.wrapping', ['wrap', 'nowrap']),
		size('gap', 'tools.flexbox.gap_px', 16, 0, 100),
		size('count', 'tools.flexbox.items', 6, 1, 30),
	],
	(v) => {
		const allowed: Record<string, readonly string[]> = {
			direction: ['row', 'column', 'row-reverse', 'column-reverse'],
			justify: [
				'flex-start',
				'center',
				'flex-end',
				'space-between',
				'space-around',
				'space-evenly',
			],
			align: ['stretch', 'flex-start', 'center', 'flex-end', 'baseline'],
			wrap: ['wrap', 'nowrap'],
		};
		for (const key of Object.keys(allowed)) {
			if (!allowed[key].includes(field(v, key))) {
				throw new Error('Invalid flex option');
			}
		}
		const css = `display:flex;flex-direction:${field(v, 'direction')};justify-content:${field(v, 'justify')};align-items:${field(v, 'align')};flex-wrap:${field(v, 'wrap')};gap:${Number(field(v, 'gap'))}px;`;
		const items = Array.from(
			{ length: Number(field(v, 'count')) },
			(_, i) => `<div class="item">${i + 1}</div>`,
		).join('');
		return {
			...result(`.container { ${css} }`, 'flexbox.css'),
			preview: preview(
				`<div style="${css}min-height:260px">${items}</div>`,
				'.item{background:#176b46;color:white;padding:24px;min-width:45px;border-radius:8px;text-align:center}',
			),
		};
	},
);
