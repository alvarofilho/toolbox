import { tool, result } from '@app/features/tools/_shared/definition';

import { count } from '@app/features/tools/_shared/execution-controls';

import { boundedNumber, field } from '@app/core/models/tool';

import { sqlInsert } from '@app/features/tools/json/data-utils';

import { synthetic } from '@app/features/tools/_shared/controls';

import { people, PERSON_FIELDS } from '@app/features/tools/brazilian/person';

import { table } from '@app/features/tools/database/sql-controls';

export const definition = tool(
	'database-seed',
	[count, table],
	(v) =>
		result(
			sqlInsert(
				people(boundedNumber(field(v, 'count'), 1, 1000), PERSON_FIELDS, 'SP', 18, 65),
				field(v, 'table'),
			),
			'synthetic-seed.sql',
		),
	undefined,
	synthetic,
);
