import { toASCII, toUnicode } from 'punycode';

import { tool, result } from '@app/features/tools/_shared/definition';

import { source } from '@app/features/tools/_shared/controls';

import { field } from '@app/core/models/tool';

import { direction } from '@app/features/tools/converters/conversion-controls';

export const definition = tool(
	'punycode',
	[source, direction],
	(v) => {
		const domain = field(v, 'input').trim();
		if (!domain || /[\s/:@]/.test(domain)) {
			throw new Error('Informe somente o domínio / Enter only a domain');
		}
		return result(
			field(v, 'mode') === 'decode' ? toUnicode(domain) : toASCII(domain),
			'domain.txt',
		);
	},
	{ input: 'ação.com.br' },
);
