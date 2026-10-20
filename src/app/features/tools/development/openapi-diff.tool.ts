import { compare } from 'fast-json-patch';

import { tool, result } from '@app/features/tools/_shared/definition';

import { source } from '@app/features/tools/_shared/controls';

import { second } from '@app/features/tools/_shared/execution-controls';

import { field } from '@app/core/models/tool';

import { openApi, apiExample } from '@app/features/tools/development/openapi';

export const definition = tool(
	'openapi-diff',
	[source, second],
	(v) => {
		const before = openApi(field(v, 'input')),
			after = openApi(field(v, 'second'));
		const key = (op: Record<string, unknown>) => `${String(op['method'])} ${String(op['path'])}`;
		const oldKeys = before.operations.map(key),
			newKeys = after.operations.map(key);
		return result({
			added: newKeys.filter((k) => !oldKeys.includes(k)),
			removed: oldKeys.filter((k) => !newKeys.includes(k)),
			patch: compare(before.doc, after.doc),
			compatibilityAssessed: false,
		});
	},
	{ input: apiExample, second: apiExample.replace('1.0.0', '1.1.0') },
	'tools.openapi-diff.structural_diff_with_added_removed_operati',
);
