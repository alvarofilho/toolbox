import { convertCase } from '@app/features/tools/_shared/encoding';

import { tool, result } from '@app/features/tools/_shared/definition';

import { source } from '@app/features/tools/_shared/controls';

import { mode } from '@app/features/tools/_shared/execution-controls';

import { field } from '@app/core/models/tool';

export const definition = tool(
	'pascal-camel',
	[source, mode(['pascal', 'camel'])],
	(v) => result(convertCase(field(v, 'input'), field(v, 'mode')), 'case.txt'),
	{ input: 'minha primeira ferramenta' },
);
