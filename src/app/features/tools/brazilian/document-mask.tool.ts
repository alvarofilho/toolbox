import { synthetic } from '@app/features/tools/_shared/controls';

import { tool, result } from '@app/features/tools/_shared/definition';

import { source, select } from '@app/features/tools/_shared/controls';

import { mode } from '@app/features/tools/_shared/execution-controls';

import { field } from '@app/core/models/tool';

export const definition = tool(
	'document-mask',
	[
		source,
		select(
			'document',
			'Documento',
			'Document',
			['CPF', 'CNPJ', 'CEP', 'Telefone', 'PIS', 'CNH', 'Título de Eleitor', 'NF-e'].map((s) => [
				s,
				s,
				s,
			]),
		),
		mode(['format', 'strip']),
	],
	(v) => {
		const kind = field(v, 'document');
		const s = field(v, 'input')
			.replace(kind === 'CNPJ' ? /[^\dA-Za-z]/g : /\D/g, '')
			.toUpperCase();
		const masks: Record<string, string> = {
			CPF: '###.###.###-##',
			CNPJ: '##.###.###/####-##',
			CEP: '#####-###',
			Telefone: s.length === 10 ? '(##) ####-####' : '(##) #####-####',
			PIS: '###.#####.##-#',
			CNH: '###########',
			'Título de Eleitor': '#### #### ####',
			'NF-e': '#### #### #### #### #### #### #### #### #### #### ####',
		};
		const mask = masks[kind];
		if (!mask || (mask.match(/#/g)?.length ?? 0) !== s.length) {
			throw new Error('Quantidade de caracteres inválida / Invalid character count');
		}
		let i = 0;
		return result(
			field(v, 'mode') === 'strip' ? s : mask.replace(/#/g, () => s[i++]),
			'document.txt',
		);
	},
	{ input: '52998224725', document: 'CPF' },
	synthetic,
);
