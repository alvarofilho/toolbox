import { tool, result } from '@app/features/tools/_shared/definition';

import { input, select } from '@app/features/tools/_shared/controls';

import { field } from '@app/core/models/tool';

const quote = (s: string) => `'${s.replace(/'/g, `'"'"'`)}'`;

export const definition = tool(
	'curl',
	[
		input('url', 'URL', 'URL', 'https://example.com/api', 'text'),
		select(
			'method',
			'Método',
			'Method',
			['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS'].map((m) => [m, m, m]),
		),
		input(
			'headers',
			'Headers (um por linha)',
			'Headers (one per line)',
			'Accept: application/json',
		),
		input('body', 'Corpo', 'Body'),
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
