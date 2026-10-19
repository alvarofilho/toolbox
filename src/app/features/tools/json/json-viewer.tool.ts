import { tool, result } from '@app/features/tools/_shared/definition';

import { source } from '@app/features/tools/_shared/controls';

import { field } from '@app/core/models/tool';

import { json } from '@app/features/tools/_shared/data';

import { escapeHtml, preview } from '@app/features/tools/_shared/preview';

import { sample } from '@app/features/tools/json/sample-data';

export const definition = tool(
	'json-viewer',
	[source],
	(v) => {
		const value = json(field(v, 'input'));
		const tree = (val: unknown, depth = 0): string => {
			if (depth > 30) {
				throw new Error('Profundidade máxima: 30 / Max depth: 30');
			}
			if (val === null || typeof val !== 'object') {
				return escapeHtml(JSON.stringify(val));
			}
			return `<details open><summary>${Array.isArray(val) ? 'Array' : 'Object'} (${Object.keys(val).length})</summary><ul>${Object.entries(
				val,
			)
				.map(
					([key, item]) => `<li><strong>${escapeHtml(key)}</strong>: ${tree(item, depth + 1)}</li>`,
				)
				.join('')}</ul></details>`;
		};
		return { ...result(value), preview: preview(tree(value)) };
	},
	sample,
);
