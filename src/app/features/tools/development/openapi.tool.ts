import { tool, result } from '@app/features/tools/_shared/definition';

import { source } from '@app/features/tools/_shared/controls';

import { field } from '@app/core/models/tool';

import { object } from '@app/features/tools/_shared/data';

import { preview, escapeHtml } from '@app/features/tools/_shared/preview';

import { openApi, apiExample } from '@app/features/tools/development/openapi';

export const definition = tool(
	'openapi',
	[source],
	(v) => {
		const api = openApi(field(v, 'input'));
		return {
			...result({
				info: api.doc['info'],
				servers: api.doc['servers'] ?? [],
				operations: api.operations,
			}),
			preview: preview(
				`<h1>${escapeHtml(String(object(api.doc['info'])['title']))}</h1>${api.operations.map((op) => `<details><summary><b>${escapeHtml(String(op['method']))}</b> ${escapeHtml(String(op['path']))} — ${escapeHtml(String(op['summary']))}</summary><pre>${escapeHtml(JSON.stringify(op, null, 2))}</pre></details>`).join('')}`,
			),
		};
	},
	{ input: apiExample },
	'tools.openapi.views_openapi_3_x_swagger_2_0_operations_e',
);
