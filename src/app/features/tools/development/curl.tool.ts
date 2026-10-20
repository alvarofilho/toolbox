import { tool, result } from '@app/features/tools/_shared/definition';

import { input, select } from '@app/features/tools/_shared/controls';

import { field } from '@app/core/models/tool';

const quote = (s: string) => `'${s.replace(/'/g, `'"'"'`)}'`;

export const definition = tool(
	'curl',
	[
		input('url', 'tools.curl.url', 'https://example.com/api', 'text'),
		select(
			'method',
			'tools.curl.method',
			['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS'].map((m) => [m]),
			undefined,
		),
		input('headers', 'tools.curl.headers_one_per_line', 'Accept: application/json', undefined),
		input('body', 'tools.curl.body', undefined, undefined),
	],
	(v) => {
		const url = new URL(field(v, 'url'));
		if (!['http:', 'https:'].includes(url.protocol)) {
			throw new Error('Use HTTP(S)');
		}
		const method = field(v, 'method');
		if (!/^(GET|POST|PUT|PATCH|DELETE|HEAD|OPTIONS)$/.test(method)) {
			throw new Error('Invalid method');
		}
		const lines = [
			`curl --request ${method}`,
			...field(v, 'headers')
				.split(/\r?\n/)
				.filter(Boolean)
				.map((h) => `--header ${quote(h)}`),
			...(field(v, 'body') ? [`--data-raw ${quote(field(v, 'body'))}`] : []),
			`--url ${quote(url.toString())}`,
		];
		return result(lines.join(' \\\n  '), 'request.sh');
	},
);
