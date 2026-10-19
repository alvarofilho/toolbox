import { tool, result } from '@app/features/tools/_shared/definition';

import { source } from '@app/features/tools/_shared/controls';

import { field } from '@app/core/models/tool';

export const definition = tool(
	'url-parser',
	[source],
	(v) => {
		const url = new URL(field(v, 'input'));
		return result({
			protocol: url.protocol,
			username: url.username,
			password: url.password,
			hostname: url.hostname,
			port: url.port,
			pathname: url.pathname,
			query: Array.from(url.searchParams.entries()),
			fragment: url.hash,
			origin: url.origin,
		});
	},
	{ input: 'https://example.com:8443/api/users?page=1&page=2#result' },
);
