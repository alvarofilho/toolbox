import 'reflect-metadata';

import { fromBER } from 'asn1js';

import { tool, result } from '@app/features/tools/_shared/definition';

import { source } from '@app/features/tools/_shared/controls';

import { field } from '@app/core/models/tool';

import { base64Bytes } from '@app/features/tools/_shared/bytes';

import { pemBlocks } from '@app/features/tools/security/pem';

import { decodeHint } from '@app/features/tools/security/decoding-hint';

export const definition = tool(
	'asn1',
	[source],
	(v) => {
		const value = field(v, 'input').trim();
		const bytes = value.startsWith('-----')
			? pemBlocks(value)[0].bytes
			: base64Bytes(value.replace(/\s/g, ''));
		const parsed = fromBER(bytes.buffer, {
			maxDepth: 32,
			maxNodes: 10000,
			maxContentLength: 1000000,
		});
		if (parsed.offset === -1 || parsed.offset !== bytes.length) {
			throw new Error(parsed.result.error || 'ASN.1 inválido / Invalid ASN.1');
		}
		return result(parsed.result.toJSON());
	},
	{ input: 'MAYCAQECAQI=' },
	decodeHint,
);
