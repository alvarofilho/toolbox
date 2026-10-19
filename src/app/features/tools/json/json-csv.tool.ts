import Papa from 'papaparse';

import { tool, result } from '@app/features/tools/_shared/definition';

import { source } from '@app/features/tools/_shared/controls';

import { field } from '@app/core/models/tool';

import { json } from '@app/features/tools/_shared/data';

import { rowsFrom } from '@app/features/tools/json/data-utils';

import { sample } from '@app/features/tools/json/sample-data';

export const definition = tool(
	'json-csv',
	[source],
	(v) =>
		result(Papa.unparse(rowsFrom(json(field(v, 'input'))), { escapeFormulae: true }), 'data.csv'),
	sample,
);
