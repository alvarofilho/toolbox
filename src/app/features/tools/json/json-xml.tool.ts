import XMLBuilder from 'fast-xml-builder';

import { tool, result } from '@app/features/tools/_shared/definition';

import { source } from '@app/features/tools/_shared/controls';

import { field } from '@app/core/models/tool';

import { json } from '@app/features/tools/_shared/data';

import { sample } from '@app/features/tools/json/sample-data';

export const definition = tool(
	'json-xml',
	[source],
	(v) =>
		result(
			new XMLBuilder({ format: true, ignoreAttributes: false }).build({
				root: json(field(v, 'input')),
			}),
			'data.xml',
		),
	sample,
);
