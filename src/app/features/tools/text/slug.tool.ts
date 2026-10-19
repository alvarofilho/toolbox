import { tool, result } from '@app/features/tools/_shared/definition';

import { source } from '@app/features/tools/_shared/controls';

import { field } from '@app/core/models/tool';

export const definition = tool(
	'slug',
	[source],
	(v) =>
		result(
			field(v, 'input')
				.normalize('NFD')
				.replace(/[\u0300-\u036f]/g, '')
				.toLowerCase()
				.trim()
				.replace(/[^\p{L}\p{N}]+/gu, '-')
				.replace(/^-+|-+$/g, ''),
			'slug.txt',
		),
	{ input: 'Olá, minha primeira página!' },
);
