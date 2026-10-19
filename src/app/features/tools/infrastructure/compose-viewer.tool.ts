import { tool, result } from '@app/features/tools/_shared/definition';

import { source } from '@app/features/tools/_shared/controls';

import { field } from '@app/core/models/tool';

import { object } from '@app/features/tools/_shared/data';

import { preview, escapeHtml } from '@app/features/tools/_shared/preview';

import { parseDocument } from '@app/features/tools/development/document-parser';

export const definition = tool(
	'compose-viewer',
	[source],
	(v) => {
		const doc = object(parseDocument(field(v, 'input'))),
			services = object(doc['services']);
		const rows = Object.entries(services).map(([name, value]) => ({ name, ...object(value) }));
		return {
			...result({
				services: rows,
				networks: doc['networks'] ?? {},
				volumes: doc['volumes'] ?? {},
			}),
			preview: preview(
				`<h1>Docker Compose</h1><div style="display:flex;flex-wrap:wrap;gap:16px">${rows.map((s) => `<section style="border:1px solid #9ca;padding:16px;border-radius:8px;max-width:300px"><h2>${escapeHtml(s.name)}</h2><pre>${escapeHtml(JSON.stringify(s, null, 2))}</pre></section>`).join('')}</div>`,
			),
		};
	},
	{
		input:
			'services:\n  web:\n    image: nginx:alpine\n    ports: ["8080:80"]\n    depends_on: [db]\n  db:\n    image: postgres:17',
	},
);
