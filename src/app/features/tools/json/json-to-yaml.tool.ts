import { stringify } from 'yaml';

import { tool, result } from '@app/features/tools/_shared/definition';

import { source } from '@app/features/tools/_shared/controls';

import { field } from '@app/core/models/tool';

import { json } from '@app/features/tools/_shared/data';

import { sample } from '@app/features/tools/json/sample-data';

export const definition = tool(
	'json-to-yaml',
	[source],
	(v) => result(stringify(json(field(v, 'input'))), 'data.yaml'),
	sample,
);
