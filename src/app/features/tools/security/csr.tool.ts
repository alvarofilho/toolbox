import 'reflect-metadata';

import { Pkcs10CertificateRequest } from '@peculiar/x509';

import { tool, result } from '@app/features/tools/_shared/definition';

import { source } from '@app/features/tools/_shared/controls';

import { field } from '@app/core/models/tool';

import { decodeHint } from '@app/features/tools/security/decoding-hint';

export const definition = tool(
	'csr',
	[source],
	async (v) => {
		const csr = new Pkcs10CertificateRequest(field(v, 'input'));
		return result({
			subject: csr.subject,
			algorithm: csr.signatureAlgorithm,
			extensions: csr.extensions.map((e) => e.toString()),
			signatureVerified: await csr.verify(),
			text: csr.toString('text'),
		});
	},
	undefined,
	decodeHint,
);
