import ipaddr from 'ipaddr.js';

import { tool, result } from '@app/features/tools/_shared/definition';

import { source } from '@app/features/tools/_shared/controls';

import { field } from '@app/core/models/tool';

import { subnet } from '@app/features/tools/infrastructure/subnet';

export const definition = tool(
	'ipv6',
	[source],
	(v) => {
		const value = field(v, 'input').trim();
		const r = subnet(value.includes('/') ? value : `${value}/128`);
		if (r['family'] !== 'ipv6') {
			throw new Error('Use IPv6');
		}
		const address = ipaddr.parse(value.split('/')[0]);
		return result({
			...r,
			expanded: address.toNormalizedString(),
			compressed: address.toString(),
		});
	},
	{ input: '2001:db8::1/64' },
);
