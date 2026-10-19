import { tool, result } from '@app/features/tools/_shared/definition';

import { source } from '@app/features/tools/_shared/controls';

import { field } from '@app/core/models/tool';

import { direction } from '@app/features/tools/converters/conversion-controls';

export const definition = tool(
	'unicode',
	[source, direction],
	(v) =>
		result(
			field(v, 'mode') === 'encode'
				? Array.from(field(v, 'input'))
						.map((c) => `\\u{${c.codePointAt(0)?.toString(16)}}`)
						.join('')
				: field(v, 'input').replace(
						/\\u\{([0-9a-f]{1,6})\}|\\u([0-9a-f]{4})/gi,
						(_, a: string | undefined, b: string | undefined) =>
							String.fromCodePoint(parseInt(a ?? b ?? '', 16)),
					),
			'unicode.txt',
		),
	{ input: 'Olá 👋' },
);
