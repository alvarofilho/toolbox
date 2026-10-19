import { tool, result } from '@app/features/tools/_shared/definition';

import { source } from '@app/features/tools/_shared/controls';

import { field } from '@app/core/models/tool';

import { utf8, hexBytes, bytesHex } from '@app/features/tools/_shared/bytes';

import { direction } from '@app/features/tools/converters/conversion-controls';

export const definition = tool(
	'hex',
	[source, direction],
	(v) =>
		result(
			field(v, 'mode') === 'decode'
				? new TextDecoder('utf-8', { fatal: true }).decode(
						hexBytes(field(v, 'input').replace(/\s/g, '')),
					)
				: bytesHex(utf8(field(v, 'input'))),
			'hex.txt',
		),
	{ input: 'Olá' },
);
