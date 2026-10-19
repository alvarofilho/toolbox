import { tool, result } from '@app/features/tools/_shared/definition';

import { source } from '@app/features/tools/_shared/controls';

import { field } from '@app/core/models/tool';

export const definition = tool(
	'word-count',
	[source],
	(v) => {
		const s = field(v, 'input');
		return result({
			characters: Array.from(new Intl.Segmenter('pt-BR', { granularity: 'grapheme' }).segment(s))
				.length,
			codePoints: Array.from(s).length,
			utf16Units: s.length,
			utf8Bytes: new TextEncoder().encode(s).length,
			words: (s.match(/[\p{L}\p{N}]+(?:['’-][\p{L}\p{N}]+)*/gu) ?? []).length,
			lines: s ? s.split(/\r?\n/).length : 0,
			paragraphs: s.trim() ? s.trim().split(/\n\s*\n/).length : 0,
		});
	},
	{ input: 'Olá, mundo!\n\nUma segunda linha.' },
);
