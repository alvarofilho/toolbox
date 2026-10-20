import { format } from 'sql-formatter';

import { tool, result } from '@app/features/tools/_shared/definition';

import { source, select } from '@app/features/tools/_shared/controls';

import { field } from '@app/core/models/tool';

const sqlDialect = select(
	'dialect',
	'tools.sql-formatter.dialect',
	[
		['sql', 'tools.sql-formatter.sql'],
		['postgresql', 'tools.sql-formatter.postgresql'],
		['mysql', 'tools.sql-formatter.mysql'],
		['transactsql', 'tools.sql-formatter.sql_server'],
		['sqlite', 'tools.sql-formatter.sqlite'],
	],
	undefined,
);

export const definition = tool(
	'sql-formatter',
	[source, sqlDialect],
	(v) => {
		const dialect = field(v, 'dialect');
		if (
			dialect !== 'sql' &&
			dialect !== 'postgresql' &&
			dialect !== 'mysql' &&
			dialect !== 'transactsql' &&
			dialect !== 'sqlite'
		) {
			throw new Error('Invalid dialect');
		}
		return result(format(field(v, 'input'), { language: dialect }), 'formatted.sql');
	},
	{ input: 'select id,name from users where active=true order by name' },
);
