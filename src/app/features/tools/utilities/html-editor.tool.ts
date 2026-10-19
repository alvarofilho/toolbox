import { field, text } from '@app/core/models/tool';

import { result, tool } from '@app/features/tools/_shared/definition';

import { source } from '@app/features/tools/_shared/controls';

import { preview } from '@app/features/tools/_shared/preview';

import DOMPurify from 'dompurify';

export const definition = tool(
	'html-editor',
	[source],
	(v) => {
		const sanitized = DOMPurify.sanitize(field(v, 'input'), { USE_PROFILES: { html: true } });
		return {
			...result({ sanitized, characters: sanitized.length }),
			preview: preview(sanitized),
		};
	},
	{ input: '<h1>Olá</h1><p>HTML exibido com segurança.</p>' },
	text(
		'Scripts e atributos perigosos são removidos antes da prévia.',
		'Scripts and dangerous attributes are removed before preview.',
		undefined,
		'tools.html-editor',
	),
);
