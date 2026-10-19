import { marked } from 'marked';

import { tool, result } from '@app/features/tools/_shared/definition';

import { source } from '@app/features/tools/_shared/controls';

import { field } from '@app/core/models/tool';

import { preview } from '@app/features/tools/_shared/preview';

export const definition = tool(
	'markdown',
	[source],
	async (v) => {
		const html = await marked.parse(field(v, 'input'));
		return { ...result(html, 'preview.html'), preview: preview(html) };
	},
	{ input: '# Olá\n\n**Markdown** com listas:\n\n- Um\n- Dois' },
);
