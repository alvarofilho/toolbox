import { stringify } from 'yaml';

import { tool, result } from '@app/features/tools/_shared/definition';

import { source } from '@app/features/tools/_shared/controls';

import { field } from '@app/core/models/tool';

import { parseDocument } from '@app/features/tools/development/document-parser';

export const definition = tool(
	'yaml-formatter',
	[source],
	(v) => result(stringify(parseDocument(field(v, 'input'))), 'formatted.yaml'),
	{ input: 'name: Ana\nitems: [1, 2, 3]' },
);
