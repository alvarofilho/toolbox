import { tool, result } from '@app/features/tools/_shared/definition';

import { source } from '@app/features/tools/_shared/controls';

import { field } from '@app/core/models/tool';

import { parseEnv } from '@app/features/tools/infrastructure/parse-env';

export const definition = tool(
	'env-validator',
	[source],
	(v) => {
		const parsed = parseEnv(field(v, 'input')),
			unresolved = parsed.references.filter((k) => !Object.hasOwn(parsed.values, k));
		return result({
			valid: !parsed.duplicates.length && !unresolved.length,
			keys: Object.keys(parsed.values),
			duplicates: parsed.duplicates,
			unresolvedReferences: unresolved,
			emptyValues: Object.keys(parsed.values).filter((k) => !parsed.values[k]),
		});
	},
	{ input: 'PORT=3000\nHOST=localhost\nURL="http://${HOST}:${PORT}"' },
);
