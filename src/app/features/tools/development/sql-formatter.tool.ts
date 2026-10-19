import { format } from 'sql-formatter';

import { tool, result } from '@app/features/tools/_shared/definition';

import { source, select } from '@app/features/tools/_shared/controls';

import { field } from '@app/core/models/tool';

const sqlDialect = select(
	'dialect',
	'Dialeto',
	'Dialect',
	[
		['sql', 'SQL', 'SQL'],
		['postgresql', 'PostgreSQL', 'PostgreSQL'],
		['mysql', 'MySQL', 'MySQL'],
		['transactsql', 'SQL Server', 'SQL Server'],
		['sqlite', 'SQLite', 'SQLite'],
	],
	undefined,
	'tools.sql-formatter',
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
