import { IE_SUPPORTED_UFS } from '@br-validators/core/inscricao-estadual';

import { select } from '@app/features/tools/_shared/controls';

export const uf = select(
	'uf',
	'common.state',
	IE_SUPPORTED_UFS.map((s) => [s]),
	'SP',
);
