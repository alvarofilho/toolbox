import 'reflect-metadata';

import { tool, result } from '@app/features/tools/_shared/definition';

import { input } from '@app/features/tools/_shared/controls';

import { field } from '@app/core/models/tool';

export const definition = tool(
	'csp',
	[
		input('script', 'tools.csp.script_sources_space_separated', "'self'", 'text'),
		input('style', 'tools.csp.style_sources', "'self'", 'text'),
		input('image', 'tools.csp.image_sources', "'self' data:", 'text'),
		input('connect', 'tools.csp.connection_sources', "'self'", 'text'),
	],
	(v) => {
		const clean = (s: string) => {
			if (/[;\r\n]/.test(s)) {
				throw new Error('Origens inválidas / Invalid sources');
			}
			return s.trim() || "'none'";
		};
		return result(
			`default-src 'none'; script-src ${clean(field(v, 'script'))}; style-src ${clean(field(v, 'style'))}; img-src ${clean(field(v, 'image'))}; connect-src ${clean(field(v, 'connect'))}; font-src 'self'; base-uri 'none'; object-src 'none'; frame-ancestors 'none'; form-action 'self'`,
			'csp.txt',
		);
	},
);
