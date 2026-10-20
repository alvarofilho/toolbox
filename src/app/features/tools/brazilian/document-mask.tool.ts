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
			'tools.document-mask.document',
			[
				['CPF', 'tools.document-mask.cpf'],
				['CNPJ', 'tools.document-mask.cnpj'],
				['CEP', 'tools.document-mask.cep'],
				['Telefone', 'tools.document-mask.telefone'],
				['PIS', 'tools.document-mask.pis'],
				['CNH', 'tools.document-mask.cnh'],
				['Título de Eleitor', 'tools.document-mask.titulo_de_eleitor'],
				['NF-e', 'tools.document-mask.nf_e'],
			],
			undefined,
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
