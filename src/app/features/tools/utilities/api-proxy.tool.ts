import { field } from '@app/core/models/tool';

import { input, select } from '@app/features/tools/_shared/controls';

import { result, tool } from '@app/features/tools/_shared/definition';

export const definition = tool(
	'api-proxy',
	[
		input('target', 'tools.api-proxy.api_url', 'https://api.example.com', 'text'),
		input('path', 'tools.api-proxy.local_prefix', '/api', 'text'),
		select(
			'format',
			'tools.api-proxy.format',
			[
				['vite', 'tools.api-proxy.vite_config'],
				['nginx', 'tools.api-proxy.nginx'],
			],
			undefined,
		),
	],
	(v) => {
		let target: URL;
		try {
			target = new URL(field(v, 'target'));
		} catch {
			throw new Error('URL da API inválida / Invalid API URL');
		}
		if (!['http:', 'https:'].includes(target.protocol) || target.username || target.password) {
			throw new Error(
				'Use uma URL HTTP(S) sem credenciais / Use an HTTP(S) URL without credentials',
			);
		}
		const prefix = field(v, 'path').trim();
		if (!/^\/[A-Za-z0-9/_-]*$/.test(prefix) || prefix.includes('..')) {
			throw new Error('Prefixo local inválido / Invalid local prefix');
		}
		const body =
			field(v, 'format') === 'nginx'
				? `location ${prefix}/ {\n    proxy_pass ${target.origin}/;\n    proxy_set_header Host $host;\n    proxy_set_header X-Real-IP $remote_addr;\n}`
				: `export default {\n  server: {\n    proxy: {\n      '${prefix}': {\n        target: '${target.origin}',\n        changeOrigin: true,\n        rewrite: (path) => path.replace(/^${prefix.replaceAll('/', '\\/')}/, ''),\n      },\n    },\n  },\n}`;
		return result(body, field(v, 'format') === 'nginx' ? 'api-proxy.conf' : 'vite.proxy.ts');
	},
	undefined,
	'tools.api-proxy.generates_configuration_for_you_to_host_a_',
);
