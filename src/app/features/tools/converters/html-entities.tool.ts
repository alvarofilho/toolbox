import * as he from 'he';

import { tool, result } from '@app/features/tools/_shared/definition';

import { source } from '@app/features/tools/_shared/controls';

import { field } from '@app/core/models/tool';

import { direction } from '@app/features/tools/converters/conversion-controls';

export const definition = tool(
	'html-entities',
	[source, direction],
	(v) =>
		result(
			field(v, 'mode') === 'decode'
				? he.decode(field(v, 'input'))
				: he.encode(field(v, 'input'), { useNamedReferences: true }),
			'entities.txt',
		),
	{ input: '<p>Olá & bem-vindo</p>' },
);
