import { tool, result } from '@app/features/tools/_shared/definition';

import { field } from '@app/core/models/tool';

import { preview } from '@app/features/tools/_shared/preview';

import { size } from '@app/features/tools/frontend/controls';

export const definition = tool(
	'css-grid',
	[
		size('columns', 'Colunas', 'Columns', 3, 1, 12, 'tools.css-grid'),
		size('rows', 'Linhas', 'Rows', 2, 1, 12, 'tools.css-grid'),
		size('gap', 'Espaçamento (px)', 'Gap (px)', 16, 0, 100, 'tools.css-grid'),
		size('height', 'Altura das linhas (px)', 'Row height (px)', 80, 20, 300, 'tools.css-grid'),
	],
	(v) => {
		const columns = Number(field(v, 'columns')),
			rows = Number(field(v, 'rows')),
			gap = Number(field(v, 'gap')),
			height = Number(field(v, 'height'));
		const css = `display:grid;grid-template-columns:repeat(${columns},minmax(0,1fr));grid-template-rows:repeat(${rows},${height}px);gap:${gap}px;`;
		return {
			...result(`.container { ${css} }`, 'grid.css'),
			preview: preview(
				`<div style="${css}">${Array.from({ length: columns * rows }, (_, i) => `<div style="display:grid;place-items:center;background:#176b46;color:white;border-radius:6px">${i + 1}</div>`).join('')}</div>`,
			),
		};
	},
);
