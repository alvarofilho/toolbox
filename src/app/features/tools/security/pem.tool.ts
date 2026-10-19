import 'reflect-metadata';

import { tool, result } from '@app/features/tools/_shared/definition';

import { source } from '@app/features/tools/_shared/controls';

import { field } from '@app/core/models/tool';

import { bytesHex } from '@app/features/tools/_shared/bytes';

import { pemBlocks } from '@app/features/tools/security/pem';

import { decodeHint } from '@app/features/tools/security/decoding-hint';

export const definition = tool(
	'pem',
	[source],
	(v) =>
		result(
			pemBlocks(field(v, 'input')).map(({ label, bytes }) => ({
				label,
				byteLength: bytes.length,
				hex: bytesHex(bytes),
			})),
		),
	undefined,
	decodeHint,
);
