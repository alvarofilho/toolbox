import { tool, result } from '@app/features/tools/_shared/definition';

import { select } from '@app/features/tools/_shared/controls';

import { field } from '@app/core/models/tool';

import { preview } from '@app/features/tools/_shared/preview';

import { size } from '@app/features/tools/frontend/controls';

const choose = (key: string, pt: string, en: string, options: readonly string[]) =>
	select(
		key,
		pt,
		en,
		options.map((s) => [s, s, s]),
	);

export const definition = tool(
	'flexbox',
	[
		choose('direction', 'Direção', 'Direction', ['row', 'column', 'row-reverse', 'column-reverse']),
		choose('justify', 'Alinhamento principal', 'Main-axis alignment', [
			'flex-start',
			'center',
			'flex-end',
			'space-between',
			'space-around',
			'space-evenly',
		]),
		choose('align', 'Alinhamento transversal', 'Cross-axis alignment', [
			'stretch',
			'flex-start',
			'center',
			'flex-end',
			'baseline',
		]),
		choose('wrap', 'Quebra de linha', 'Wrapping', ['wrap', 'nowrap']),
		size('gap', 'Espaçamento (px)', 'Gap (px)', 16, 0, 100),
		size('count', 'Itens', 'Items', 6, 1, 30),
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
