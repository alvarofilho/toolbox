import { IE_SUPPORTED_UFS } from '@br-validators/core/inscricao-estadual';

import { select } from '@app/features/tools/_shared/controls';

export const uf = select(
	'uf',
	'UF',
	'State',
	IE_SUPPORTED_UFS.map((s) => [s, s, s]),
	'SP',
);
