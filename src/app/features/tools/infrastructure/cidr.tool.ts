import { tool, result } from '@app/features/tools/_shared/definition';

import { source } from '@app/features/tools/_shared/controls';

import { field } from '@app/core/models/tool';

import { subnet } from '@app/features/tools/infrastructure/subnet';

export const definition = tool('cidr', [source], (v) => result(subnet(field(v, 'input'))), {
	input: '10.0.0.0/16',
});
