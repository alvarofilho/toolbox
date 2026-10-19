import 'reflect-metadata';

import { fromBER } from 'asn1js';

import { PFX } from 'pkijs';

import { tool, result } from '@app/features/tools/_shared/definition';

import { input } from '@app/features/tools/_shared/controls';

import { file, firstFile } from '@app/features/tools/_shared/files';

import { field, text } from '@app/core/models/tool';

import { utf8 } from '@app/features/tools/_shared/bytes';

export const definition = tool(
	'p12-explorer',
	[file(), input('password', 'Senha do arquivo P12', 'P12 file password', '', 'password')],
	async (v, files) => {
		const selected = firstFile(files);
		if (selected.size > 20_000_000) {
			throw new Error('Limite: 20 MB / Limit: 20 MB');
		}
		const bytes = new Uint8Array(await selected.arrayBuffer());
		const parsed = fromBER(bytes.buffer);
		if (parsed.offset === -1 || parsed.offset !== bytes.length) {
			throw new Error('Arquivo PKCS#12 inválido / Invalid PKCS#12 file');
		}
		const pfx = new PFX({ schema: parsed.result });
		await pfx.parseInternalValues({
			password: utf8(field(v, 'password')).buffer,
			checkIntegrity: true,
		});
		return result({
			filename: selected.name,
			version: pfx.version,
			authSafeContentType: pfx.authSafe.contentType,
			hasMac: !!pfx.macData,
			integrityVerified: !!pfx.macData,
			authenticatedSafeParsed: !!pfx.parsedValue?.authenticatedSafe,
		});
	},
	undefined,
	text(
		'A senha é usada localmente para abrir e conferir a integridade. Chaves privadas não são exibidas nem enviadas.',
		'The password is used locally to open the file and check integrity. Private keys are not displayed or uploaded.',
	),
);
