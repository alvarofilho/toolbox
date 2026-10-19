import { tool, result } from '@app/features/tools/_shared/definition';

import { source } from '@app/features/tools/_shared/controls';

import { field } from '@app/core/models/tool';

import { subnet } from '@app/features/tools/infrastructure/subnet';

export const definition = tool(
	'ipv4',
	[source],
	(v) => {
		const r = subnet(field(v, 'input'));
		if (r['family'] !== 'ipv4') {
			throw new Error('Use IPv4/CIDR');
		}
		return result(r);
	},
	{ input: '192.168.1.10/24' },
);
