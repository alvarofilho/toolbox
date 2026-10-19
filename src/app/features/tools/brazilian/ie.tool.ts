import {
	validateInscricaoEstadual,
	IE_SUPPORTED_UFS,
} from '@br-validators/core/inscricao-estadual';

import { synthetic } from '@app/features/tools/_shared/controls';

import { tool, result } from '@app/features/tools/_shared/definition';

import { source } from '@app/features/tools/_shared/controls';

import { field } from '@app/core/models/tool';

import { uf } from '@app/features/tools/brazilian/document-controls';

export const definition = tool(
	'ie',
	[source, uf],
	(v) => {
		const state = IE_SUPPORTED_UFS.find((s) => s === field(v, 'uf'));
		if (!state) {
			throw new Error('UF inválida / Invalid state');
		}
		return result(validateInscricaoEstadual(field(v, 'input'), { uf: state }));
	},
	{ input: '110.042.490.114', uf: 'SP' },
	synthetic,
);
