import 'reflect-metadata';

import { X509Certificate } from '@peculiar/x509';

import { tool, result } from '@app/features/tools/_shared/definition';

import { source } from '@app/features/tools/_shared/controls';

import { field } from '@app/core/models/tool';

import { bytesHex } from '@app/features/tools/_shared/bytes';

import { certInfo } from '@app/features/tools/security/certificates';

import { decodeHint } from '@app/features/tools/security/decoding-hint';

export const definition = tool(
	'x509',
	[source],
	async (v) => {
		const cert = new X509Certificate(field(v, 'input'));
		return result({
			...certInfo(cert),
			sha256: bytesHex(new Uint8Array(await cert.getThumbprint('SHA-256'))),
			signatureVerified: false,
		});
	},
	undefined,
	decodeHint,
);
