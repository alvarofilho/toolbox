import { compare } from 'fast-json-patch';

import { tool, result } from '@app/features/tools/_shared/definition';

import { source } from '@app/features/tools/_shared/controls';

import { second } from '@app/features/tools/_shared/execution-controls';

import { field } from '@app/core/models/tool';

import { parseEnv } from '@app/features/tools/infrastructure/parse-env';

export const definition = tool(
	'env-diff',
	[source, second],
	(v) => {
		const a = parseEnv(field(v, 'input')),
			b = parseEnv(field(v, 'second'));
		return result({
			patch: compare(a.values, b.values),
			duplicates: { first: a.duplicates, second: b.duplicates },
		});
	},
	{ input: 'PORT=3000\nMODE=dev', second: 'PORT=8080\nMODE=production\nDEBUG=false' },
);
